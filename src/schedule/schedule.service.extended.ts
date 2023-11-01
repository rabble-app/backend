import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { IScheduleTeam, PaymentStatus } from '../lib/types';
import { OrderStatus } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TeamsServiceExtension } from '../teams/teams.service.extension';

@Injectable()
export class ScheduleServiceExtended {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
    private usersService: UsersService,
    private productsService: ProductsService,
    private notificationsService: NotificationsService,
    private teamsServiceExtension: TeamsServiceExtension,
  ) {}

  async processCompleteOrders(
    pendingOrders: Array<{ id: string; minimumTreshold: number }>,
  ) {
    try {
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

        // get the order amount
        const expectedPayments = await this.prisma.payment.aggregate({
          where: {
            orderId: order.id,
          },
          _sum: {
            amount: true,
          },
        });

        if (capturedPayments._sum.amount >= expectedPayments._sum.amount) {
          await this.paymentService.updateOrder({
            where: {
              id: order.id,
            },
            data: {
              status: 'PENDING_DELIVERY',
            },
          });
        }
      });
    } catch (error) {}
  }

  async createNewOrder(team: IScheduleTeam) {
    try {
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
    } catch (error) {}
  }

  async createUserBasket(teamId: string, newOrderId: string) {
    try {
      const teamMembers = await this.teamsServiceExtension.getAllTeamUsers(
        teamId,
      );
      if (teamMembers.length > 0) {
        teamMembers.forEach(async (member) => {
          // create their basket for them
          const lastOrderProducts = await this.prisma.basketC.findMany({
            where: {
              teamId,
              userId: member.userId,
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

              const productPrice = +product.price * oldProduct.quantity;

              const newProduct = {
                orderId: newOrderId,
                userId: oldProduct.userId,
                productId: oldProduct.productId,
                quantity: oldProduct.quantity,
                price: productPrice,
              };

              // check for portioned products
              if (product.type == 'PORTIONED_SINGLE_PRODUCT') {
                await this.paymentService.processPortionedProduct(
                  teamId,
                  newOrderId,
                  oldProduct.quantity,
                  oldProduct.productId,
                  oldProduct.userId,
                  productPrice,
                );
              }

              // add to basket
              await this.prisma.basket.create({
                data: newProduct,
              });

              // increment totalAmount
              totalAmount += +product.price;
            }

            // record the payment to be made by the user
            await this.paymentService.recordPayment({
              orderId: newOrderId,
              userId: member.userId,
              amount: totalAmount,
              status: PaymentStatus.PENDING,
            });

            // send notification
            await this.notificationsService.createNotification({
              teamId,
              title: 'New Order',
              text: `A new order has started for your ${member.team.name} team`,
              userId: member.userId,
              notficationToken: member.user.notificationToken,
            });
          }
        });
      }
    } catch (error) {}
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
        teamId: true,
      },
    });
  }

  async getExhaustedOrders() {
    return await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        deadline: {
          lte: new Date(),
        },
        minimumTreshold: {
          lte: this.prisma.order.fields.accumulatedAmount, // order is captured only when threshold has been met
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

  async getPendingPayment() {
    return await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
      },
      include: {
        user: {
          select: {
            stripeDefaultPaymentMethodId: true,
            stripeCustomerId: true,
            phone: true,
            notificationToken: true,
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

  async getCapturedOrders() {
    return await this.prisma.order.findMany({
      where: {
        status: 'PENDING_DELIVERY',
        deliveryDate: null,
      },
    });
  }

  async getUsersWithNoPaymentMethod() {
    return await this.prisma.user.findMany({
      where: {
        OR: [
          {
            stripeDefaultPaymentMethodId: {
              contains: 'tok_',
            },
          },
          {
            stripeDefaultPaymentMethodId: null,
          },
        ],
      },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeDefaultPaymentMethodId: true,
      },
    });
  }

  async getLatestPayments() {
    const currentDate = new Date();
    const last24hours = new Date(
      currentDate.getTime() - 1 * 1 * 24 * 60 * 60 * 1000,
    );
    return await this.prisma.payment.findMany({
      where: {
        createdAt: {
          gte: last24hours,
        },
      },
      include: {
        order: {
          include: {
            team: {
              select: {
                id: true,
                producerId: true,
              },
            },
          },
        },
      },
    });
  }
}
