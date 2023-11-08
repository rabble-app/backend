import Stripe from 'stripe';
import { Basket, BasketC, Payment, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { IPaymentAuth, PaymentStatus } from '../lib/types';
import { PrismaService } from '../prisma.service';
import { PaymentService } from './payment.service';
import { UpdateBasketBulkDto } from './dto/update-basket-bulk.dto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

@Injectable()
export class PaymentServiceExtension {
  constructor(
    private readonly paymentService: PaymentService,
    private prisma: PrismaService,
  ) {}

  async getUserPaymentOptions(id: string): Promise<object | null> {
    const result = await stripe.customers.listPaymentMethods(id);
    const unique = [
      ...new Map(result.data.map((m) => [m.card.last4, m])).values(),
    ];
    return unique;
  }

  async removePaymentOption(id: string): Promise<object | null> {
    return await stripe.paymentMethods.detach(id);
  }

  async captureFund(
    paymentIntentId: string,
    amountToCapture = null,
  ): Promise<object | null> {
    try {
      let options = null;
      if (amountToCapture) {
        options = {
          amount_to_capture: amountToCapture,
        };
        const result = await stripe.paymentIntents.capture(
          paymentIntentId,
          options,
        );
        return result;
      }
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
    return await stripe.paymentIntents.update(paymentIntentId, { metadata });
  }
}
