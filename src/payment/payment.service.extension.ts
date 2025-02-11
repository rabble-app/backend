import Stripe from 'stripe';
import { Basket, BasketC, Payment, Prisma } from '@prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { IPaymentAuth, PaymentStatus } from '../lib/types';
import { PrismaService } from '../prisma.service';
import { PaymentService } from './payment.service';
import { UpdateBasketBulkDto } from './dto/update-basket-bulk.dto';
import { CaptureIntentDto } from './dto/capture-intent.dto';
import { TopUpDto } from './dto/topup.dto';
import { ReferralsService } from '../referrals/referrals.service';
import { Logger } from 'winston';
@Injectable()
export class PaymentServiceExtension {
  private readonly stripe: Stripe;
  constructor(
    private readonly paymentService: PaymentService,
    private prisma: PrismaService,
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
    private readonly referralsService: ReferralsService,
    @Inject('LOGGER') private readonly logger: Logger,
  ) {
    this.stripe = new Stripe(this.parameters.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  async getUserPaymentOptions(id: string): Promise<object | null> {
    const result = await this.stripe.customers.listPaymentMethods(id);
    const unique = [
      ...new Map(result.data.map((m) => [m.card.last4, m])).values(),
    ];
    return unique;
  }

  async removePaymentOption(id: string): Promise<object | null> {
    return await this.stripe.paymentMethods.detach(id);
  }

  async captureFund(
    paymentIntentId: string,
    options: Stripe.PaymentIntentCaptureParams = null,
  ): Promise<object | null> {
    try {
      const result = await this.stripe.paymentIntents.capture(
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
  ): Promise<object | null> {
    return await this.stripe.paymentIntents.update(paymentIntentId, {
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
    });
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
      status: PaymentStatus.COUPON_USED,
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

  async handleTopUpPayment(topUpDto: TopUpDto): Promise<Payment | null> {
    // get team latestOrder
    const latestOrder = await this.paymentService.getTeamLatestOrder(
      topUpDto.teamId,
    );

    // capture payment
    const captureResult = await this.captureFund(topUpDto.paymentIntentId);

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
      return null;
    }
  }
}
