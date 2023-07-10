import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IScheduleTeam, PaymentStatus } from '../lib/types';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentServiceExtension } from '../payment/payment.service.extension';
import { ScheduleServiceExtended } from './schedule.service.extended';

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private paymentServiceExtension: PaymentServiceExtension,
    private scheduleServiceExtended: ScheduleServiceExtended,
  ) {}

  async chargeUsers() {
    // check if status is pending and threshold has been reached
    const pendingOrders =
      await this.scheduleServiceExtended.getFullPendingOrders();
    // if we have such orders
    if (pendingOrders.length > 0) {
      await this.processPendingOrders(pendingOrders);
    }

    return true;
  }

  async cancelOrders() {
    const expiredOrders = await this.scheduleServiceExtended.getExpiredOrders();

    // if we have such orders
    if (expiredOrders.length > 0) {
      expiredOrders.forEach(async (order) => {
        await this.scheduleServiceExtended.updateOrderStatus(
          order.id,
          'FAILED',
        );
      });
    }

    return true;
  }

  async completeOrders() {
    // check if status is pending and threshold has been reached
    const pendingOrders =
      await this.scheduleServiceExtended.getExhaustedOrders();
    // if we have such orders
    if (pendingOrders.length > 0) {
      await this.scheduleServiceExtended.processCompleteOrders(pendingOrders);
    }

    return true;
  }

  async authorizePayments() {
    try {
      const result = await this.scheduleServiceExtended.getPendingPayment();
      if (result && result.length > 0) {
        result.forEach(async (payment) => {
          if (
            payment.user.stripeDefaultPaymentMethodId &&
            payment.user.stripeCustomerId
          ) {
            // authorize payment for this user
            const paymentRecord = await this.handleAuthorizePayments(payment);

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
  // fix: remove datatype
  async handleAuthorizePayments(payment: any) {
    return await this.paymentServiceExtension.schedulePaymentAuthorization({
      stripeDefaultPaymentMethodId: payment.user.stripeDefaultPaymentMethodId,
      amount: payment.amount,
      orderId: payment.orderId,
      stripeCustomerId: payment.user.stripeCustomerId,
      teamId: payment.order.team.id,
      paymentId: payment.id,
    });
  }

  async handleNewOrders() {
    const buyingTeams = await this.scheduleServiceExtended.getTeams();
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
      if (payment.paymentIntentId && payment.paymentIntentId !== 'null') {
        const result = await this.paymentServiceExtension.captureFund(
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
      }
    });
  }

  async processNewOrders(teams: Array<IScheduleTeam>) {
    try {
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
          const newOrder = await this.scheduleServiceExtended.createNewOrder(
            team,
          );

          // create basket for users
          await this.scheduleServiceExtended.createUserBasket(
            lastOrder.id,
            newOrder.id,
          );
        }
      }
    } catch (error) {}
  }

  async processPendingOrders(pendingOrders: Array<{ id: string }>) {
    try {
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
    } catch (error) {}
  }
}
