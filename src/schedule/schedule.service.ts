import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { PaymentStatus } from '../lib/types';
import { NotificationsService } from '../notifications/notifications.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
    private notificationsService: NotificationsService,
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

  async captureFunds(
    pendingPayments: Array<{
      paymentIntentId: string;
      userId: string;
      orderId: string;
    }>,
  ) {
    pendingPayments.forEach(async (payment) => {
      let captureStatus = PaymentStatus.CAPTURED;
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

  async getFullPendingOrders() {
    return await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
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

  async completeOrders() {
    // check if status is pending and threshold has been reached
    const pendingOrders = await this.getFullPendingOrders();
    // if we have such orders
    if (pendingOrders.length > 0) {
      await this.processCompleteOrders(pendingOrders);
    }

    return true;
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

  async createNewOrders() {
    // for all buying teams, get their frequency
    // get their last order created date
    //  compare the infor to know whether it time to create new orders(if current timestamp - timestamp of last order is greater than the frequency)
    // if it is time, create new order for the team
    // duplicate the team members basket for the new order
    // check skip next shipment
    // what if there is a change in price?
    const expiredOrders = await this.getExpiredOrders();

    // if we have such orders
    if (expiredOrders.length > 0) {
      expiredOrders.forEach(async (order) => {
        await this.updateOrderStatus(order.id, 'FAILED');
      });
    }

    return true;
  }
}
