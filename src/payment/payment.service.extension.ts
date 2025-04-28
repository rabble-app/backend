import Stripe from 'stripe';
import { Basket, BasketC, Payment, Prisma, PaymentType, PaymentStatus } from '@prisma/client';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { IPaymentAuth } from '../lib/types';
import { PrismaService } from '../prisma.service';
import { PaymentService } from './payment.service';
import { UpdateBasketBulkDto } from './dto/update-basket-bulk.dto';
import { CaptureIntentDto } from './dto/capture-intent.dto';
import { TopUpDto } from './dto/topup.dto';
import { ReferralsService } from '../referrals/referrals.service';
import { Logger } from 'winston';
import { add, addYears } from 'date-fns';
@Injectable()
export class PaymentServiceExtension {
  private readonly stripe: Stripe;
  private readonly supplementStripe: Stripe;
  constructor(
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private prisma: PrismaService,
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
    private readonly referralsService: ReferralsService,
    @Inject('LOGGER') private readonly logger: Logger,
  ) {
    this.stripe = new Stripe(this.parameters.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
    this.supplementStripe = new Stripe(this.parameters.SUPPLEMENT_STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  async getUserPaymentOptions(id: string, isSupplementApp = false): Promise<object | null> {;
    const stripe = isSupplementApp ? this.supplementStripe : this.stripe;
    const result = await stripe.customers.listPaymentMethods(id);

    const unique = [
      ...new Map(result.data.map((m) => [m.card.last4, m])).values(),
    ];
    return unique;
  }

  async removePaymentOption(id: string, isSupplementApp = false): Promise<object | null> {
    const stripe = isSupplementApp ? this.supplementStripe : this.stripe;
    return await stripe.paymentMethods.detach(id);
  }

  async captureFund(
    paymentIntentId: string,
    options: Stripe.PaymentIntentCaptureParams = null,
    isSupplementApp = false,
  ): Promise<object | null> {
    try {
      const stripe = isSupplementApp ? this.supplementStripe : this.stripe;
      const result = await stripe.paymentIntents.capture(
        paymentIntentId,
        options,
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async updateBasketItem(params: {
    where: Prisma.BasketCWhereUniqueInput;
    data: Prisma.BasketCUpdateInput;
  }): Promise<BasketC> {
    const { where, data } = params;
    return await this.prisma.basketC.update({
      data,
      where,
    });
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
        isSupplementApp
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
    metadata: Stripe.MetadataParam,
    isSupplementApp = false,
  ): Promise<object | null> {
    const stripe = isSupplementApp ? this.supplementStripe : this.stripe;
    return await stripe.paymentIntents.update(paymentIntentId, {
      metadata,
    });
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
    await this.updatePaymentIntent(captureIntentDto.paymentIntentId, {
      order_id: orderId,
      user_id: captureIntentDto.userId,
    }, true);
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
      true
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
    const hasActiveSubscription = await this.checkUserSubscriptionStatus(topUpDto.userId);
    if (!hasActiveSubscription) {
      this.logger.warn('User does not have an active subscription for top-up payment', {
        userId: topUpDto.userId
      });
      return 1;
    }

    // get team latestOrder
    const latestOrder = await this.paymentService.getTeamLatestOrder(
      topUpDto.teamId,
    );

    // capture payment
    const captureResult = await this.captureFund(topUpDto.paymentIntentId, null, true);

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
          deliveryDate: add(new Date(), { weeks: latestOrder.team.supplementTeamProducts?.product?.leadTime ?? 1 })
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
        select: { stripeDefaultPaymentMethodId: true, stripeCustomerId: true }
      });
      console.log('user', user) 

      if (!user?.stripeDefaultPaymentMethodId || !user?.stripeCustomerId) {
        return null;
      }

      // Create payment intent for subscription
      const paymentIntent = await this.paymentService.createIntent(
        {
          amount: 28, // £28 yearly subscription
          currency: 'gbp',
          customerId: user.stripeCustomerId,
          paymentMethodId: user.stripeDefaultPaymentMethodId,
        },
        true,
        true // isSupplementApp
      );

      if (!paymentIntent || paymentIntent.status !== 'requires_capture') {
        return null;
      }

      // Capture the payment
      const captureResult = await this.captureFund(paymentIntent.id, null, true);
      if (!captureResult) {
        return null;
      }

      // Record the subscription payment
      const paymentData = {
        userId,
        amount: 28,
        paymentIntentId: paymentIntent.id,
        status: PaymentStatus.CAPTURED,
        type: PaymentType.YEARLY_SUBSCRIPTION,
        expiryDate: addYears(new Date(), 1),
      };

      return await this.paymentService.recordPayment(paymentData);
    } catch (error) {
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
          in: [PaymentStatus.CAPTURED, PaymentStatus.COUPON_USED]
        },
        type: PaymentType.OTHERS,
      });

      // If user has less than 2 successful payments, no subscription needed
      if (!successfulPayments || successfulPayments.length < 2) {
        return true;
      }

      // Check for active subscription
      const activeSubscription = await this.findPayments({
        userId,
        status: PaymentStatus.CAPTURED,
        type: PaymentType.YEARLY_SUBSCRIPTION,
        expiryDate: {
          gt: new Date(),
        },
      });

      // Return true only if there is an active subscription
      return activeSubscription && activeSubscription.length > 0;
    } catch (error) {
      this.logger.error('Error checking subscription status:', error);
      return false;
    }
  }
}
