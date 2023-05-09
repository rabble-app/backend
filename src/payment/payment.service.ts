import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { AddPaymentCardDto } from './dto/add-payment-card.dto';
import { UsersService } from '../users/users.service';
import { ChargeUserDto } from './dto/charge-user.dto ';
import { PrismaService } from '../prisma.service';
import { Basket, Order, Payment, Prisma } from '@prisma/client';
import { IOrder, IPayment, PaymentStatus } from '../lib/types';
import { AddBulkBasketDto, AddToBasket } from './dto/add-bulk-basket.dto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

@Injectable()
export class PaymentService {
  constructor(
    private readonly userService: UsersService,
    private prisma: PrismaService,
  ) {}

  async createCustomer(phone: string): Promise<{ id: string } | null> {
    try {
      const params: Stripe.CustomerCreateParams = {
        phone,
      };
      const response = await stripe.customers.create(params);
      return {
        id: response.id,
      };
    } catch (error) {}
  }

  async addCustomerCard(
    addPaymentCardDto: AddPaymentCardDto,
  ): Promise<{ stripeCustomerId: string; paymentMethodId: string } | null> {
    try {
      const newCustomer = await this.createCustomer(addPaymentCardDto.phone);

      await this.userService.updateUser({
        where: { phone: addPaymentCardDto.phone },
        data: { stripeCustomerId: newCustomer.id },
      });

      // create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: addPaymentCardDto.cardNumber,
          exp_month: addPaymentCardDto.expiringMonth,
          exp_year: addPaymentCardDto.expiringYear,
          cvc: addPaymentCardDto.cvc,
        },
      });

      // attach payment method to user
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: newCustomer.id,
      });

      return {
        stripeCustomerId: newCustomer.id,
        paymentMethodId: paymentMethod.id,
      };
    } catch (error) {}
  }

  async chargeUser(chargeUserDto: ChargeUserDto): Promise<object | null> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: chargeUserDto.amount,
        currency: chargeUserDto.currency,
        customer: chargeUserDto.customerId,
        payment_method: chargeUserDto.paymentMethodId,
        confirm: true,
        capture_method: 'manual',
      });

      // record intent
      const paymentData = {
        amount: chargeUserDto.amount,
        paymentIntentId: paymentIntent.id,
        status: PaymentStatus.INTENT_CREATED,
      };
      await this.recordPayment(paymentData);
      return {
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async createOrder(orderData: IOrder): Promise<Order> {
    return await this.prisma.order.create({
      data: orderData,
    });
  }

  async recordPayment(paymentData: IPayment): Promise<Payment> {
    return await this.prisma.payment.create({
      data: paymentData,
    });
  }

  async updatePayment(params: {
    where: Prisma.PaymentWhereUniqueInput;
    data: Prisma.PaymentUpdateInput;
  }): Promise<Payment> {
    const { where, data } = params;
    return await this.prisma.payment.update({
      data,
      where,
    });
  }

  async saveBulkBasket(addBulkBasketDto: AddBulkBasketDto) {
    return await this.prisma.basket.createMany({
      data: addBulkBasketDto.basket,
    });
  }

  async addToBasket(addToBasket: AddToBasket) {
    return await this.prisma.basket.create({
      data: addToBasket,
    });
  }

  async deleteFromBasket(
    where: Prisma.BasketWhereUniqueInput,
  ): Promise<Basket> {
    return await this.prisma.basket.delete({
      where,
    });
  }
}
