import Stripe from 'stripe';
import { AddBulkBasketDto, AddToBasket } from './dto/add-bulk-basket.dto';
import { AddPaymentCardDto } from './dto/add-payment-card.dto';
import { BasketC, Order, Payment, Prisma } from '@prisma/client';
import { CreateIntentDto } from './dto/create-intent.dto';
import { Injectable } from '@nestjs/common';
import { ICreateIntent, IOrder, IPayment, PaymentStatus } from '../lib/types';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { ChargeUserDto } from './dto/charge-user.dto ';
import { AddSingleBasketDto } from './dto/add-single-basket.dto';

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
  ): Promise<{ paymentMethodId: string } | null> {
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
      customer: addPaymentCardDto.stripeCustomerId,
    });

    // make it user default payment method
    await this.userService.updateUser({
      where: {
        stripeCustomerId: addPaymentCardDto.stripeCustomerId,
      },
      data: {
        stripeDefaultPaymentMethodId: paymentMethod.id,
        cardLastFourDigits: addPaymentCardDto.cardNumber.slice(-4),
      },
    });

    return {
      paymentMethodId: paymentMethod.id,
    };
  }

  async chargeUser(chargeUserDto: ChargeUserDto): Promise<object | null> {
    let orderId: string;
    let paymentIntentId: string;

    if (!chargeUserDto.isApplePay) {
      const paymentIntent = await this.handleIntentCreation(chargeUserDto);
      paymentIntentId = paymentIntent.id;
    } else {
      // make it user default payment method
      await this.userService.updateUser({
        where: {
          id: chargeUserDto.userId,
        },
        data: {
          stripeDefaultPaymentMethodId: chargeUserDto.paymentMethodId,
        },
      });
      paymentIntentId = chargeUserDto.paymentIntentId;
    }

    // if teamId exist, get the latest order of that team
    if (chargeUserDto.teamId) {
      const result = await this.getTeamLatestOrder(chargeUserDto.teamId);
      orderId = result.id;

      // accumulate amount paid
      await this.accumulateAmount(orderId, chargeUserDto.amount);
    }

    // record intent
    const result = await this.handleRecordPayment(
      orderId,
      paymentIntentId,
      chargeUserDto.amount,
      chargeUserDto.userId,
    );
    if (result) {
      return {
        paymentIntentId,
        orderId,
      };
    } else {
      return null;
    }
  }

  async handleIntentCreation(
    chargeUserDto: ChargeUserDto,
  ): Promise<{ id: string; clientSecret: string } | null> {
    return await this.createIntent({
      amount: chargeUserDto.amount,
      currency: chargeUserDto.currency,
      customerId: chargeUserDto.customerId,
      paymentMethodId: chargeUserDto.paymentMethodId,
    });
  }

  async handleRecordPayment(
    orderId: string,
    paymentIntentId: string,
    amount: number,
    userId: string,
  ): Promise<Payment | null> {
    // record intent
    const paymentData = {
      orderId,
      paymentIntentId,
      amount: amount,
      status: PaymentStatus.INTENT_CREATED,
      userId: userId,
    };
    return await this.recordPayment(paymentData);
  }

  async getTeamLatestOrder(teamId: string): Promise<Order | null> {
    return await this.prisma.order.findFirst({
      where: {
        teamId: teamId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async accumulateAmount(orderId: string, amount: number): Promise<void> {
    const result = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: { accumulatedAmount: { increment: amount } },
    });
    if (
      result.accumulatedAmount >= result.minimumTreshold &&
      result.deadline.getTime() - new Date().getTime() > 86400000
    ) {
      const newDeadline = new Date().getTime() + 86400000;
      // update order to end in the next 24 hours
      await this.updateOrder({
        where: {
          id: result.id,
        },
        data: {
          deadline: new Date(newDeadline),
        },
      });
    }
  }

  async createIntentForApplePay(
    createIntentDto: CreateIntentDto,
  ): Promise<object | null> {
    const paymentIntent = await this.createIntent({
      amount: createIntentDto.amount,
      currency: createIntentDto.currency,
      customerId: createIntentDto.customerId,
    });
    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.clientSecret,
    };
  }

  async createIntent(
    createIntentData: ICreateIntent,
  ): Promise<{ id: string; clientSecret: string } | null> {
    const parameters = {
      amount: createIntentData.amount * 100,
      currency: createIntentData.currency,
      customer: createIntentData.customerId,
    };

    if (createIntentData.paymentMethodId) {
      parameters['payment_method'] = createIntentData.paymentMethodId;
      parameters['confirm'] = true;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      ...parameters,
      capture_method: 'manual',
      setup_future_usage: 'off_session',
    });
    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
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

  async updateOrder(params: {
    where: Prisma.OrderWhereUniqueInput;
    data: Prisma.OrderUpdateInput;
  }): Promise<Order> {
    const { where, data } = params;
    return await this.prisma.order.update({
      data,
      where,
    });
  }

  async saveBulkBasket(addBulkBasketDto: AddBulkBasketDto) {
    const basketRecord = addBulkBasketDto.basket.map((item: AddToBasket) => {
      return {
        teamId: addBulkBasketDto.teamId,
        userId: item.userId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      };
    });

    await this.prisma.basketC.createMany({
      data: basketRecord,
    });

    return await this.prisma.basket.createMany({
      data: addBulkBasketDto.basket,
    });
  }

  async findProductInCopyBasket(
    productId: string,
    teamId: string,
    userId: string,
  ): Promise<BasketC | null> {
    return await this.prisma.basketC.findFirst({
      where: {
        productId,
        teamId,
        userId,
      },
    });
  }

  async addToBasket(addSingleBasketDto: AddSingleBasketDto): Promise<BasketC> {
    const {
      teamId,
      userId,
      productId,
      orderId,
      price,
      quantity,
      deadlineReached,
    } = addSingleBasketDto;
    if (!deadlineReached) {
      await this.prisma.basket.create({
        data: {
          orderId,
          userId,
          productId,
          price,
          quantity,
        },
      });
    }
    return await this.prisma.basketC.create({
      data: {
        teamId,
        userId,
        productId,
        price,
        quantity,
      },
    });
  }

  async deleteFromBasket(
    where: Prisma.BasketCWhereUniqueInput,
  ): Promise<BasketC> {
    return await this.prisma.basketC.delete({
      where,
    });
  }
}
