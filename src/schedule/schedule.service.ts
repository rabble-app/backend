import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IScheduleTeam,
  PaymentStatus,
  PaymentWithUserInfo,
  notificationType,
} from '../lib/types';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentServiceExtension } from '../payment/payment.service.extension';
import { ScheduleServiceExtended } from './schedule.service.extended';
import { PaymentService } from '../payment/payment.service';
import { UsersService } from '../../src/users/users.service';
import { TeamsService } from '../../src/teams/teams.service';
import { TeamsServiceExtension } from '../../src/teams/teams.service.extension';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private paymentServiceExtension: PaymentServiceExtension,
    private scheduleServiceExtended: ScheduleServiceExtended,
    private paymentService: PaymentService,
    private usersService: UsersService,
    private teamsService: TeamsService,
    private teamsServiceExtension: TeamsServiceExtension,
  ) {}

  async chargeUsers() {
    // check if status is pending and threshold has been reached
    const pendingOrders =
      await this.scheduleServiceExtended.getExhaustedOrders();
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
        await this.paymentService.updateOrder({
          where: {
            id: order.id,
          },
          data: {
            status: 'FAILED',
          },
        });
        // send notification to team members if threshold was not reached
        const teamMembers = await this.teamsServiceExtension.getAllTeamUsers(
          order.teamId,
        );
        if (teamMembers.length > 0) {
          teamMembers.forEach(async (member) => {
            // send notification
            await this.notificationsService.createNotification({
              title: 'Order Failed',
              text: `Your current order with ${member.team.name} team failed because the supplier's threshold was not met`,
              userId: member.userId,
              teamId: member.teamId,
              notficationToken: member.user.notificationToken,
              type: notificationType.TEAM,
            });
          });
        }
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
          if (payment.order.deadline.getTime() > new Date().getTime()) {
            const otherNotificationConditions = {
              userId: payment.userId,
              orderId: payment.orderId,
              teamId: payment.order.teamId,
              notficationToken: payment.user.notificationToken,
              type: notificationType.PAYMENT,
            };
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
                  text: `We were unable to charge your card for your order with ${payment.order.team.name} buying team, please fund your card, you will be removed from the buying team if we can't charge your card`,
                  ...otherNotificationConditions,
                });
              }
            } else {
              // send notification that user should add default payment method
              await this.notificationsService.createNotification({
                title: 'Payment Failure',
                text: `We were unable to charge your card for your order with ${payment.order.team.name} buying team, kindly login into the app and set a default payment method`,
                ...otherNotificationConditions,
              });
            }
          }
        });
      }
      return true;
    } catch (error) {
      // console.log(error);
    }
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

  async captureFunds(pendingPayments: Array<PaymentWithUserInfo>) {
    try {
      pendingPayments.forEach(async (payment) => {
        // be sure that it has payment intent
        if (payment.paymentIntentId && payment.paymentIntentId !== 'null') {
          let amountToCapture: Decimal = payment.amount;
          // check all portioned product for that order that did not meet treshold to know whether he has items there if so
          // minus that from the overall payment amount
          const portionedProducts =
            await this.prisma.partitionedProductsBasket.findMany({
              where: {
                orderId: payment.orderId,
                threshold: {
                  gt: this.prisma.partitionedProductsBasket.fields.accumulator,
                },
              },
              include: {
                PartitionedProductUsersRecord: {
                  where: {
                    userId: payment.userId,
                  },
                },
              },
            });
          if (portionedProducts && portionedProducts.length > 0) {
            portionedProducts.forEach((portionedProduct) => {
              if (
                portionedProduct &&
                portionedProduct.PartitionedProductUsersRecord.length > 0
              ) {
                amountToCapture = new Decimal(
                  +amountToCapture -
                    +portionedProduct.PartitionedProductUsersRecord[0].amount,
                );
              }
            });
          }
          if (+amountToCapture > 0) {
            const result = await this.paymentServiceExtension.captureFund(
              payment.paymentIntentId,
              +amountToCapture * 100,
            );

            // check whether capture was successful and send notification if not
            if (
              result &&
              result.hasOwnProperty('status') &&
              result['status'] == 'succeeded'
            ) {
              // update the payment status to captured or failed, depending on the success of the capture
              await this.prisma.payment.update({
                where: {
                  paymentIntentId: payment.paymentIntentId,
                },
                data: {
                  status: PaymentStatus.CAPTURED,
                },
              });
              // send notification
              await this.notificationsService.createNotification({
                title: 'Rabble Payment Capture Success',
                text: `We have captured your payment with ${payment.order.team.name} team`,
                userId: payment.userId,
                orderId: payment.orderId,
                teamId: payment.order.team.id,
                notficationToken: payment.user.notificationToken,
                type: notificationType.PAYMENT,
              });
            } else {
              // send notification
              await this.notificationsService.createNotification({
                title: 'Rabble Payment Failure',
                text: `We were unable to charge your card for your order with ${payment.order.team.name} team`,
                userId: payment.userId,
                orderId: payment.orderId,
                teamId: payment.order.team.id,
                notficationToken: payment.user.notificationToken,
                type: notificationType.PAYMENT,
              });
              // update the payment status to captured or failed, depending on the success of the capture
              await this.prisma.payment.update({
                where: {
                  paymentIntentId: payment.paymentIntentId,
                },
                data: {
                  status: PaymentStatus.FAILED,
                },
              });
            }
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
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
          team.frequency * 1000
        ) {
          // update the team next delivery Date to null to clean out the last delivery date that was set
          await this.teamsService.updateTeam({
            where: {
              id: team.id,
            },
            data: {
              nextDeliveryDate: null,
            },
          });
          // create new order
          const newOrder = await this.scheduleServiceExtended.createNewOrder(
            team,
          );
          // create basket for users
          await this.scheduleServiceExtended.createUserBasket(
            team.id,
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
          include: {
            user: {
              select: {
                notificationToken: true,
              },
            },
            order: {
              include: {
                team: {
                  select: {
                    name: true,
                    id: true,
                  },
                },
              },
            },
          },
        });
        // capture the fund
        if (pendingPayments.length > 0) {
          await this.captureFunds(pendingPayments);
        }
      });
    } catch (error) {}
  }

  async handleSetDelivery() {
    const fullOrders = await this.scheduleServiceExtended.getCapturedOrders();
    if (fullOrders && fullOrders.length > 0) {
      fullOrders.forEach(async (order) => {
        let multipler = 2;
        const currentDate = new Date();
        const currentDay = currentDate.getDay();

        // check for friday, saturday and sunday
        if (currentDay == 0) {
          multipler = 1;
        } else if (currentDay == 5) {
          multipler = 3;
        }
        const deliveryDate = new Date().getTime() + multipler * 86400000;
        // update order
        await this.paymentService.updateOrder({
          where: {
            id: order.id,
          },
          data: {
            deliveryDate: new Date(deliveryDate),
          },
        });
        // update team
        await this.teamsService.updateTeam({
          where: {
            id: order.teamId,
          },
          data: {
            nextDeliveryDate: new Date(deliveryDate),
          },
        });
        //send notification to team members if threshold was not reached
        const teamMembers = await this.teamsServiceExtension.getAllTeamUsers(
          order.teamId,
        );
        if (teamMembers.length > 0) {
          teamMembers.forEach(async (member) => {
            await this.notificationsService.createNotification({
              title: 'Order delivery date',
              text: `Delivery date has been set for your order with ${member.team.name} team`,
              userId: member.userId,
              teamId: member.teamId,
              notficationToken: member.user.notificationToken,
              type: notificationType.TEAM,
            });
          });
        }
      });
    }

    return true;
  }

  async handlePaymentMetaDataUpdate() {
    const payments = await this.scheduleServiceExtended.getLatestPayments();
    if (payments && payments.length > 0) {
      payments.forEach(async (payment) => {
        let formattedProducts: {
          name: string;
          quantity: number;
          retail_price: Decimal;
          wholesale_price: Decimal;
          vat_rate: Decimal;
          retail_price_vat: Decimal;
          wholesale_price_vat: Decimal;
        }[];
        // get user products details and save it with other information to the metadata
        let totalTax: Decimal = new Decimal(0.0);
        const userProducts = await this.prisma.basket.findMany({
          where: {
            userId: payment.userId,
            orderId: payment.orderId,
          },
          select: {
            product: {
              select: {
                name: true,
                wholesalePrice: true,
                vat: true,
              },
            },
            price: true,
            quantity: true,
          },
        });
        if (userProducts && userProducts.length > 0) {
          formattedProducts = userProducts.map((item) => {
            const retailTax = new Decimal(
              (+item.price * item.quantity * +item.product.vat) / 100,
            );
            const wholesaleTax = new Decimal(
              (+item.product.wholesalePrice *
                item.quantity *
                +item.product.vat) /
                100,
            );
            totalTax = new Decimal(+totalTax + +retailTax);
            return {
              name: item.product.name,
              quantity: item.quantity,
              retail_price: item.price,
              wholesale_price: item.product.wholesalePrice,
              vat_rate: item.product.vat,
              retail_price_vat: retailTax,
              wholesale_price_vat: wholesaleTax,
            };
          });
        }
        await this.paymentServiceExtension.updatePaymentIntent(
          payment.paymentIntentId,
          {
            transactionId: payment.id,
            orderId: payment.orderId,
            teamId: payment.order.teamId,
            userId: payment.userId,
            supplierId: payment.order.team.producerId,
            product: JSON.stringify(formattedProducts),
            totalRetailPriceVat: +totalTax,
          },
        );
      });
    }
    return true;
  }

  async handleGetPaymentMethod() {
    const users =
      await this.scheduleServiceExtended.getUsersWithNoPaymentMethod();
    if (users && users.length > 0) {
      users.forEach(async (user) => {
        if (user.stripeCustomerId) {
          // get the users payment methods in stripe and update the default in db
          const result: any =
            await this.paymentServiceExtension.getUserPaymentOptions(
              user.stripeCustomerId,
            );
          if (result && result.length > 0) {
            await this.usersService.updateUser({
              where: {
                id: user.id,
              },
              data: {
                stripeDefaultPaymentMethodId: result[0].id,
                cardLastFourDigits: result[0].card.last4,
              },
            });
          }
        }
      });
    }

    return true;
  }
}
