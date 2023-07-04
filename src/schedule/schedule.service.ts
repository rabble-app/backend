import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { IScheduleTeam, PaymentStatus } from '../lib/types';
import { NotificationsService } from '../notifications/notifications.service';
import { OrderStatus } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async chargeUsers() {
    // check if status is pending and threshold has been reached
    const pendingOrders = await this.getFullPendingOrders();
    // if we have such orders
    if (pendingOrders.length > 0) {
      await this.processPendingOrders(pendingOrders);
    }

    return true;
  }

  async cancelOrders() {
    const expiredOrders = await this.getExpiredOrders();

    // if we have such orders
    if (expiredOrders.length > 0) {
      expiredOrders.forEach(async (order) => {
        await this.updateOrderStatus(order.id, 'FAILED');
      });
    }

    return true;
  }

  async completeOrders() {
    // check if status is pending and threshold has been reached
    const pendingOrders = await this.getExhaustedOrders();
    // if we have such orders
    if (pendingOrders.length > 0) {
      await this.processCompleteOrders(pendingOrders);
    }

    return true;
  }

  async authorizePayments() {
    try {
      const result = await this.getPendingPayment();
      if (result && result.length > 0) {
        result.forEach(async (payment) => {
          if (payment.user.stripeDefaultPaymentMethodId) {
            // authorize payment for this user
            const paymentRecord =
              await this.paymentService.schedulePaymentAuthorization({
                stripeDefaultPaymentMethodId:
                  payment.user.stripeDefaultPaymentMethodId,
                amount: payment.amount,
                orderId: payment.orderId,
                stripeCustomerId: payment.user.stripeCustomerId,
                teamId: payment.order.team.id,
                paymentId: payment.id,
              });

            if (!paymentRecord) {
              // send notification that payment failed
              await this.notificationsService.createNotification({
                title: 'Payment Failure',
                text: `We were unable to charge your card for your order with ${payment.order.team.name} buying team`,
                userId: payment.userId,
                orderId: payment.orderId,
                teamId: '',
                producerId: '',
              });
            }
          } else {
            //send notification that user should add default payment method
            await this.notificationsService.createNotification({
              title: 'Payment Failure',
              text: `We were unable to charge your card for your order with ${payment.order.team.name} buying team, kindly login into the app and  set a default payment method`,
              userId: payment.userId,
              orderId: payment.orderId,
              teamId: '',
              producerId: '',
            });
          }
        });
      }
      return result;
    } catch (error) {}
  }

  async handleNewOrders() {
    const buyingTeams = await this.getTeams();
    if (buyingTeams && buyingTeams.length > 0)
      await this.processNewOrders(buyingTeams);

    return true;
  }

  async captureFunds(
    pendingPayments: Array<{
      paymentIntentId: string;
      userId: string;
      orderId: string;
    }>,
  ) {
    pendingPayments.forEach(async (payment) => {
      let captureStatus = PaymentStatus.CAPTURED;
      // be sure that it has not been captured before

      const result = await this.paymentService.captureFund(
        payment.paymentIntentId,
      );

      // check whether capture was successful and send notification if not
      if (result['status'] != 'succeeded') {
        captureStatus = PaymentStatus.FAILED;

        // send notification
        await this.notificationsService.createNotification({
          title: 'Payment Failure',
          text: `We were unable to charge your card for your order with id ${payment.orderId}`,
          userId: payment.userId,
          orderId: payment.orderId,
          teamId: '',
          producerId: '',
        });
      }
      // update the payment status to captured or failed, depending on the success of the capture
      await this.prisma.payment.update({
        where: {
          paymentIntentId: payment.paymentIntentId,
        },
        data: {
          status: captureStatus,
        },
      });
    });
  }

  async processNewOrders(teams: Array<IScheduleTeam>) {
    // check if interval has passed
    for (let index = 0; index < teams.length; index++) {
      const team = teams[index];
      const lastOrder = await this.prisma.order.findFirst({
        where: {
          teamId: team.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          teamId: true,
          minimumTreshold: true,
          createdAt: true,
        },
      });
      // if interval has passed
      if (
        new Date().getTime() - lastOrder.createdAt.getTime() >
        team.frequency
      ) {
        // create new order
        const newOrder = await this.createNewOrder(team);

        // create basket for users
        await this.createUserBasket(lastOrder.id, newOrder.id);
      }
    }
  }

  async processPendingOrders(pendingOrders: Array<{ id: string }>) {
    pendingOrders.forEach(async (order) => {
      // get the payments authorization
      const pendingPayments = await this.prisma.payment.findMany({
        where: {
          orderId: order.id,
          status: {
            not: 'CAPTURED',
          },
        },
        select: {
          paymentIntentId: true,
          userId: true,
          orderId: true,
        },
      });

      // capture the fund
      if (pendingPayments.length > 0) {
        await this.captureFunds(pendingPayments);
      }
    });
  }

  async processCompleteOrders(
    pendingOrders: Array<{ id: string; minimumTreshold: number }>,
  ) {
    pendingOrders.forEach(async (order) => {
      // get the captured payments
      const capturedPayments = await this.prisma.payment.aggregate({
        where: {
          orderId: order.id,
          status: 'CAPTURED',
        },
        _sum: {
          amount: true,
        },
      });

      if (capturedPayments._sum.amount >= order.minimumTreshold) {
        await this.updateOrderStatus(order.id, 'SUCCESSFUL');
      }
    });
  }

  async createNewOrder(team: IScheduleTeam) {
    // create new order
    const currentDate = new Date();
    // add 6 days to the current date, order closes on the 7 day
    const nextWeekDate = new Date(
      currentDate.getTime() + 1 * 6 * 24 * 60 * 60 * 1000,
    );

    // get producer threshold
    const producer = await this.usersService.findProducer({
      id: team.producerId,
    });

    const orderObject = {
      teamId: team.id,
      minimumTreshold: producer.minimumTreshold,
      deadline: nextWeekDate,
    };

    return await this.prisma.order.create({
      data: orderObject,
    });
  }

  async createUserBasket(lastOrderId: string, newOrderId: string) {
    const lastOrderProducts = await this.prisma.basket.findMany({
      where: {
        orderId: lastOrderId,
      },
    });

    if (lastOrderProducts && lastOrderProducts.length > 0) {
      let totalAmount = 0; // amount to be paid by the user

      for (let index = 0; index < lastOrderProducts.length; index++) {
        const oldProduct = lastOrderProducts[index];

        // get the product infor to check for change in price and stock
        const product = await this.productsService.getProduct(
          oldProduct.productId,
        );

        if (product.status == 'OUT_OF_STOCK') {
          continue;
        }

        const newProduct = {
          orderId: newOrderId,
          userId: oldProduct.userId,
          productId: oldProduct.productId,
          quantity: oldProduct.quantity,
          price: product.price,
        };

        // add to basket
        await this.prisma.basket.create({
          data: newProduct,
        });

        // increment totalAmount
        totalAmount += product.price;

        // record the payment to be made by the user
        await this.paymentService.recordPayment({
          orderId: newOrderId,
          userId: oldProduct.userId,
          amount: totalAmount,
          paymentIntentId: 'null',
          status: PaymentStatus.PENDING,
        });
      }
    }
  }

  async getFullPendingOrders() {
    return await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
      },
      select: {
        id: true,
        minimumTreshold: true,
      },
    });
  }

  async getExpiredOrders() {
    return await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        minimumTreshold: {
          gt: this.prisma.order.fields.accumulatedAmount,
        },
        deadline: {
          lt: new Date(),
        },
      },
      select: {
        id: true,
      },
    });
  }

  async getExhaustedOrders() {
    return await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        deadline: {
          lte: new Date(),
        },
        minimumTreshold: {
          lte: this.prisma.order.fields.accumulatedAmount,
        },
      },
      select: {
        id: true,
        minimumTreshold: true,
      },
    });
  }

  async getTeams(): Promise<IScheduleTeam[] | null> {
    return await this.prisma.buyingTeam.findMany({
      where: {
        OR: [
          {
            nextDeliveryDate: {
              lte: new Date(),
            },
          },
          {
            nextDeliveryDate: null,
          },
        ],
      },
      select: {
        id: true,
        frequency: true,
        producerId: true,
      },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });
  }

  async getPendingPayment() {
    return await this.prisma.payment.findMany({
      where: {
        paymentIntentId: 'null',
        status: PaymentStatus.PENDING,
      },
      include: {
        user: {
          select: {
            stripeDefaultPaymentMethodId: true,
            stripeCustomerId: true,
            phone: true,
          },
        },
        order: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
