import {
  Basket,
  BasketC,
  Payment,
  Prisma,
  PaymentType,
  PaymentStatus,
  SubscriptionStatus,
  Subscription,
  MembershipStatus,
} from '@prisma/client';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { IPaymentAuth } from '../lib/types';
import { PrismaService } from '../prisma.service';
import { PaymentService } from './payment.service';
import { UpdateBasketBulkDto } from './dto/update-basket-bulk.dto';
import { CaptureIntentDto } from './dto/capture-intent.dto';
import { TopUpDto } from './dto/topup.dto';
import { ReferralsService } from '../referrals/referrals.service';
import { Logger } from 'winston';
import { add, addYears, format } from 'date-fns';
import { StripeService } from '../stripe/stripe.service';
import Rollbar from 'rollbar';
import { ANNUAL_SUBSCRIPTION_AMOUNT, ANNUAL_SUBSCRIPTION_DISCOUNT, ANNUAL_SUBSCRIPTION_RRP } from '../utils/constants';
import { CourierService } from '../notifications/courier.service';
import { targetQuarterDate } from '../utils/date';
@Injectable()
export class PaymentServiceExtension {
  constructor(
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private prisma: PrismaService,
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
    private readonly referralsService: ReferralsService,
    @Inject('LOGGER') private readonly logger: Logger,
    private readonly stripeService: StripeService,
    @Inject('ROLLBAR') private readonly rollbar: Rollbar,
    private readonly courierService: CourierService,
  ) { }

  async getUserPaymentOptions(
    id: string,
    isSupplementApp = false,
  ): Promise<object | null> {
    const result = await this.stripeService.listPaymentMethods(
      id,
      isSupplementApp,
    );
    const unique = [
      ...new Map(result.data.map((m) => [m.card.last4, m])).values(),
    ];
    return unique;
  }

  async removePaymentOption(
    id: string,
    isSupplementApp = false,
  ): Promise<object | null> {
    return await this.stripeService.detachPaymentMethod(id, isSupplementApp);
  }

  async captureFund(
    paymentIntentId: string,
    options: any = null,
    isSupplementApp = false,
  ): Promise<object | null> {
    try {
      if (options.amount_to_capture) {
        options.amount_to_capture = Math.round(options.amount_to_capture);
      }
      return await this.stripeService.capturePaymentIntent(
        paymentIntentId,
        options,
        isSupplementApp,
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateBasketItem(params: {
    where: Prisma.BasketCWhereUniqueInput;
    data: Prisma.BasketCUpdateInput;
  }): Promise<BasketC> {
    const { where, data } = params;
    const result = await this.prisma.basketC.update({
      data,
      where,
      include: {
        user: true,
        product: true,
      },
    });

    // Send email notification for subscription update
    if (result.user?.email && result.product) {
      try {
        await this.courierService.sendSubscriptionUpdateEmail(
          result.user.email,
          result.user.firstName || '',
          result.product.name,
          result.quantity * +result.product.poucheSize,
          result.product.subUnit,
          `£${+result.price * result.quantity}`,
          `${format(targetQuarterDate, 'dd/MM/yyyy')}`,
          `${this.parameters.SUPPLEMENT_EMAIL_URL}/dashboard`,
        );
      } catch (error) {
        this.logger.error('Failed to send subscription update email:', error);
      }
    }

    return result;
  }

  async updateCurrentBasketItem(params: {
    where: Prisma.BasketWhereUniqueInput;
    data: Prisma.BasketUpdateInput;
  }): Promise<Basket> {
    const { where, data } = params;
    return await this.prisma.basket.update({
      data,
      where,
    });
  }

  async updateBasketBulk(
    updateBasketBulkDto: UpdateBasketBulkDto,
  ): Promise<void> {
    const items = updateBasketBulkDto.basket;

    for (let index = 0; index < items.length; index++) {
      const product = items[index];
      const result = await this.updateBasketItem({
        where: {
          id: product.basketId,
        },
        data: {
          quantity: product.quantity,
          price: product.price,
        },
      });

      if (!updateBasketBulkDto.deadlineReached) {
        // check for portioned products
        if (product.type == 'PORTIONED_SINGLE_PRODUCT') {
          // update the portioned product basket to reflect the new accumulator value
          await this.prisma.partitionedProductsBasket.update({
            where: {
              id: product.portionId,
            },
            data: {
              accumulator: product.newAccumulatorValue,
            },
          });

          // update the portioned product record
          await this.prisma.partitionedProductUsersRecord.update({
            where: {
              user_record: {
                partionedBasketId: product.portionId,
                userId: result.userId,
              },
            },
            data: {
              quantity: product.quantity,
              amount: product.price,
            },
          });
        }

        // update major basket
        await this.updateCurrentBasketItem({
          where: {
            user_unique_product: {
              userId: result.userId,
              orderId: updateBasketBulkDto.orderId,
              productId: result.productId,
            },
          },
          data: {
            quantity: product.quantity,
            price: product.price,
          },
        });
      }
    }
    return;
  }

  async schedulePaymentAuthorization(
    iPaymentAuth: IPaymentAuth,
    isSupplementApp = false,
  ): Promise<Payment> {
    try {
      const paymentIntent = await this.paymentService.createIntent(
        {
          amount: iPaymentAuth.amount,
          currency: 'gbp',
          customerId: iPaymentAuth.stripeCustomerId,
          paymentMethodId: iPaymentAuth.stripeDefaultPaymentMethodId,
        },
        true,
        isSupplementApp,
      );

      if (!paymentIntent || paymentIntent.status != 'requires_capture') {
        return null;
      } else {
        // accumulate amount paid
        await this.paymentService.accumulateAmount(
          iPaymentAuth.orderId,
          iPaymentAuth.amount,
          iPaymentAuth.teamId,
        );

        // update payment record
        const paymentData = {
          paymentIntentId: paymentIntent.id,
          status: PaymentStatus.INTENT_CREATED,
        };

        return await this.paymentService.updatePayment({
          where: {
            id: iPaymentAuth.paymentId,
          },
          data: paymentData,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updatePaymentIntent(
    paymentIntentId: string,
    metadata: any,
    isSupplementApp = false,
  ): Promise<object | null> {
    return await this.stripeService.updatePaymentIntent(
      paymentIntentId,
      { metadata },
      isSupplementApp,
    );
  }

  async handleSupplementPaymentCapture(
    captureIntentDto: CaptureIntentDto,
  ): Promise<Payment | null> {
    // get team latestOrder
    const latestOrder = await this.paymentService.getTeamLatestOrder(
      captureIntentDto.teamId,
    );
    const orderId = latestOrder?.id;

    // update payment intent
    await this.updatePaymentIntent(
      captureIntentDto.paymentIntentId,
      {
        order_id: orderId,
        user_id: captureIntentDto.userId,
      },
      true,
    );
    const applyCouponResult = await this.referralsService.applyCoupon(
      captureIntentDto.userId,
      captureIntentDto.amount * 100,
    );
    if (applyCouponResult.couponId && applyCouponResult.fullCouponCoverage) {
      this.logger.info(
        'COUPON: Full Capture Amount covered by coupon: Coupon ID: %s',
        applyCouponResult.couponId,
      );
      return await this.handleFullCouponCoverageCapture(
        captureIntentDto,
        orderId,
        applyCouponResult.couponId,
      );
    }
    const { amount, couponId, amountOff } = applyCouponResult;
    // capture payment
    const captureResult = await this.captureFund(
      captureIntentDto.paymentIntentId,
      {
        amount_to_capture: amount,
        metadata: {
          ...(couponId && { coupons: couponId }),
          ...(amountOff && { amount_off: amountOff }),
        },
      },
      true,
    );
    // check if payment was successful
    if (captureResult) {
      // record payment
      const paymentData = {
        orderId,
        paymentIntentId: captureIntentDto.paymentIntentId,
        amount: captureIntentDto.amount,
        status: PaymentStatus.CAPTURED,
        userId: captureIntentDto.userId,
        ...(couponId && { coupons: couponId }),
        ...(amountOff && { discount: amountOff / 100 }),
      };

      // accumulate amount paid
      await this.paymentService.accumulateAmount(
        orderId,
        captureIntentDto.amount,
        captureIntentDto.teamId,
      );
      return await this.paymentService.recordPayment(paymentData);
    } else {
      return null;
    }
  }

  async handleFullCouponCoverageCapture(
    captureIntentDto: CaptureIntentDto,
    orderId: string,
    couponId: string,
  ) {
    const paymentData = {
      orderId,
      paymentIntentId: captureIntentDto.paymentIntentId,
      amount: captureIntentDto.amount,
      // status: PaymentStatus.COUPON_USED,
      status: PaymentStatus.CAPTURED,
      userId: captureIntentDto.userId,
      discount: captureIntentDto.amount,
      coupons: couponId,
    };

    await this.updatePaymentIntent(captureIntentDto.paymentIntentId, {
      coupons: couponId,
      amount_off: captureIntentDto.amount * 100,
    });
    // accumulate amount paid
    await this.paymentService.accumulateAmount(
      orderId,
      captureIntentDto.amount,
      captureIntentDto.teamId,
    );

    return await this.paymentService.recordPayment(paymentData);
  }

  async findPayments(
    paymentWhereInput: Prisma.PaymentWhereInput,
  ): Promise<Payment[] | null> {
    return await this.prisma.payment.findMany({
      where: paymentWhereInput,
    });
  }

  async handleTopUpPayment(topUpDto: TopUpDto): Promise<Payment | number> {
    // Check if user has active subscription
    const hasActiveSubscription = await this.checkUserSubscriptionStatus(
      topUpDto.userId,
    );
    if (!hasActiveSubscription) {
      this.logger.warn(
        'User does not have an active subscription for top-up payment',
        {
          userId: topUpDto.userId,
        },
      );
      return 1;
    }

    // get team latestOrder
    const latestOrder = await this.paymentService.getTeamLatestOrder(
      topUpDto.teamId,
    );

    // capture payment
    const captureResult = await this.captureFund(
      topUpDto.paymentIntentId,
      null,
      true,
    );

    // check if payment was successful
    if (captureResult) {
      // save the top up basket
      await this.prisma.topUpBasket.create({
        data: {
          productId: topUpDto.productId,
          userId: topUpDto.userId,
          orderId: latestOrder?.id,
          quantity: topUpDto.quantity,
          price: topUpDto.price,
          capsulePerDay: topUpDto.capsulePerDay,
          deliveryDate: add(new Date(), {
            weeks:
              latestOrder.team.supplementTeamProducts?.product?.leadTime ?? 1,
          }),
        },
      });
      // record payment
      const paymentData = {
        orderId: latestOrder?.id,
        paymentIntentId: topUpDto.paymentIntentId,
        amount: topUpDto.amount,
        status: PaymentStatus.CAPTURED,
        userId: topUpDto.userId,
      };
      return await this.paymentService.recordPayment(paymentData);
    } else {
      return 2;
    }
  }

  async handleYearlySubscription(userId: string): Promise<Payment | null> {
    try {
      // Get user's default payment method
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { stripeDefaultPaymentMethodId: true, stripeCustomerId: true },
      });

      if (!user?.stripeDefaultPaymentMethodId || !user?.stripeCustomerId) {
        return null;
      }

      // Create payment intent for subscription
      const paymentIntent = await this.paymentService.createIntent(
        {
          amount: ANNUAL_SUBSCRIPTION_AMOUNT, // £28 yearly subscription
          currency: 'gbp',
          customerId: user.stripeCustomerId,
          paymentMethodId: user.stripeDefaultPaymentMethodId,
        },
        true,
        true, // isSupplementApp
      );
      if (!paymentIntent || paymentIntent.status !== 'requires_capture') {
        return null;
      }

      // Capture the payment
      const captureResult = await this.captureFund(
        paymentIntent.id,
        null,
        true,
      );
      if (!captureResult) {
        return null;
      }

      // Record the subscription payment
      const paymentData = {
        userId,
        amount: ANNUAL_SUBSCRIPTION_AMOUNT,
        paymentIntentId: paymentIntent.id,
        status: PaymentStatus.CAPTURED,
        type: PaymentType.YEARLY_SUBSCRIPTION,
        expiryDate: addYears(new Date(), 1),
      };

      // record in subscription table
      await this.prisma.subscription.update({
        where: { userId },
        data: {
          expiryDate: addYears(new Date(), 1),
        },
      });

      return await this.paymentService.recordPayment(paymentData);
    } catch (error) {
      this.rollbar.error('Error handling yearly subscription:', error);
      console.error('Error handling yearly subscription:', error);
      return null;
    }
  }

  async checkUserSubscriptionStatus(userId: string): Promise<boolean> {
    try {
      // Get user's successful payments count
      const successfulPayments = await this.findPayments({
        userId,
        // status should be captured or intent created
        status: {
          in: [PaymentStatus.CAPTURED, PaymentStatus.COUPON_USED],
        },
        type: PaymentType.OTHERS,
      });

      // If user has less than 2 successful payments, no subscription needed
      if (!successfulPayments || successfulPayments.length < 2) {
        return true;
      }

      // check subscription table for active subscription
      const record = await this.getSubscriptionRecord(userId);
      // check if expiry date is in the future
      if (record && new Date(record.expiryDate) > new Date() && record.status === SubscriptionStatus.ACTIVE) {
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking subscription status:', error);
      return false;
    }
  }

  async getSubscriptionRecord(
    userId: string,
  ): Promise<Subscription | null> {
    try {
      const result = await this.prisma.subscription.findFirst({
        where: {
          userId
        },
      });
      result['subscriptionAmount'] = ANNUAL_SUBSCRIPTION_AMOUNT;
      result['subscriptionRRP'] = ANNUAL_SUBSCRIPTION_RRP;
      result['subscriptionDiscount'] = ANNUAL_SUBSCRIPTION_DISCOUNT;
      return result;

    } catch (error) {
      this.logger.error('Error getting subscription status:', error);
      return null;
    }
  }

  async updateSubscriptionStatus(
    userId: string,
    status: SubscriptionStatus,
  ): Promise<Subscription | null> {
    try {
      const result = await this.prisma.subscription.update({
        where: {
          userId,
        },
        data: {
          status,
        },
        include: {
          user: {
            include: {
              subscription: true,
            }
          },
        },
      });

      // if the status is canceled, check the team members table for where the user has founding member or early member role and update that to member role
      if (status === SubscriptionStatus.CANCELED) {
        await this.prisma.teamMember.updateMany({
          where: {
            userId,
            role: {
              in: [MembershipStatus.FOUNDING_MEMBER, MembershipStatus.EARLY_MEMBER],
            },
          },
          data: {
            role: MembershipStatus.MEMBER,
          },
        });
      }

      // send email to user for membership cancellation
      if (result.user?.email) {
        try {
          const effectiveCancellationDate = format(result.user.subscription.expiryDate, 'dd/MM/yyyy');
          const reactivateMembershipUrl = `${this.parameters.SUPPLEMENT_EMAIL_URL}/dashboard`;

          await this.courierService.sendMembershipCancelledEmail(
            result.user.email,
            result.user.firstName || '',
            effectiveCancellationDate,
            reactivateMembershipUrl,
          );
        } catch (error) {
          this.logger.error('Failed to send membership cancellation email:', error);
        }
      }

      this.logger.info('Subscription status updated successfully', {
        userId,
        status,
      });

      return result;
    } catch (error) {
      this.logger.error('Error updating subscription status:', error);
      return null;
    }
  }
}
