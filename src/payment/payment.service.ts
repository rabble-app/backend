import Stripe from 'stripe';
import { AddBulkBasketDto, AddToBasket } from './dto/add-bulk-basket.dto';
import { AddPaymentCardDto } from './dto/add-payment-card.dto';
import { BasketC, Order, Payment, Prisma } from '@prisma/client';
import { CreateIntentDto } from './dto/create-intent.dto';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ICreateIntent, IOrder, IPayment, PaymentStatus } from '../lib/types';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { ChargeUserDto } from './dto/charge-user.dto ';
import { AddSingleBasketDto } from './dto/add-single-basket.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { TeamsServiceExtension } from '../teams/teams.service.extension';
import { ProductsService } from 'src/products/products.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

@Injectable()
export class PaymentService {
  constructor(
    private readonly userService: UsersService,
    private prisma: PrismaService,
    private readonly notificationService: NotificationsService,
    @Inject(forwardRef(() => TeamsServiceExtension))
    private readonly teamsServiceExtension: TeamsServiceExtension,
    private readonly productsService: ProductsService,
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
    // attach payment method to user
    await stripe.paymentMethods.attach(addPaymentCardDto.paymentMethodId, {
      customer: addPaymentCardDto.stripeCustomerId,
    });

    // make it user default payment method
    await this.userService.updateUser({
      where: {
        stripeCustomerId: addPaymentCardDto.stripeCustomerId,
      },
      data: {
        stripeDefaultPaymentMethodId: addPaymentCardDto.paymentMethodId,
      },
    });

    return {
      paymentMethodId: addPaymentCardDto.paymentMethodId,
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
      await this.accumulateAmount(
        orderId,
        chargeUserDto.amount,
        chargeUserDto.teamId,
      );
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

  async accumulateAmount(
    orderId: string,
    amount: number,
    teamId: string,
  ): Promise<void> {
    // get previous accumalated value so that we will not keep sending notification that threshold has been met
    const orderRecord = await this.prisma.order.findFirst({
      where: { id: orderId },
    });
    const lastAccumulatedValue = orderRecord.accumulatedAmount;

    const result = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: { accumulatedAmount: { increment: amount } },
    });
    if (
      result.accumulatedAmount >= result.minimumTreshold &&
      lastAccumulatedValue < result.minimumTreshold
    ) {
      await this.sendNotificationForThreshold(teamId, orderId, result.deadline);
    }
  }

  async sendNotificationForThreshold(
    teamId: string,
    orderId: string,
    orderDeadline: Date,
  ): Promise<void> {
    const teamMembers = await this.teamsServiceExtension.getAllTeamUsers(
      teamId,
    );
    if (teamMembers.length > 0) {
      teamMembers.forEach(async (member) => {
        // send notification
        await this.notificationService.createNotification({
          title: 'Threshold Reached 👏',
          text: `Congratulations! Your buying team ${member.team.name} have collectively reached the suppliers’s minimum threshold for a new shipment. You have 24 hours to add to it or invite others to join the team before the order is shipped`,
          userId: member.userId,
          teamId: member.teamId,
          notficationToken: member.user.notificationToken,
        });
      });
    }
    if (orderDeadline.getTime() - new Date().getTime() > 86400000) {
      const newDeadline = new Date().getTime() + 86400000;
      // update order to end in the next 24 hours
      await this.updateOrder({
        where: {
          id: orderId,
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
    try {
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

      // check for portioned products
      if (addBulkBasketDto.basket && addBulkBasketDto.basket.length > 0) {
        addBulkBasketDto.basket.forEach(async (item) => {
          if (item.type == 'PORTIONED_SINGLE_PRODUCT') {
            await this.processPortionedProduct(
              addBulkBasketDto.teamId,
              item.orderId,
              item.quantity,
              item.productId,
              item.userId,
              item.price,
            );
          }
        });
      }

      return await this.prisma.basket.createMany({
        data: addBulkBasketDto.basket,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async processPortionedProduct(
    teamId: string,
    orderId: string,
    quantity: number,
    productId: string,
    userId: string,
    amount: number,
  ): Promise<void> {
    // check if the product has been added to the portioned table before and increment if exisiting or create a new record
    let result = await this.prisma.partitionedProductsBasket.findFirst({
      where: {
        teamId,
        orderId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        accumulator: true,
        threshold: true,
        id: true,
      },
    });
    if (result && result.accumulator < result.threshold) {
      // update
      await this.prisma.partitionedProductsBasket.update({
        where: {
          id: result.id,
        },
        data: {
          accumulator: {
            increment: quantity,
          },
        },
      });
    } else {
      // get product info
      const product = await this.productsService.getProduct(productId);

      // create new record
      result = await this.prisma.partitionedProductsBasket.create({
        data: {
          orderId,
          productId,
          accumulator: quantity,
          threshold: product.thresholdQuantity,
          teamId,
        },
      });
    }
    // record the user information in the partitition users table
    await this.prisma.partitionedProductUsersRecord.create({
      data: {
        userId,
        amount,
        partionedBasketId: result.id,
      },
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
