import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import {
  IOrder,
  IPricePlan,
  IScheduleTeam,
  notificationType,
} from '../lib/types';
import { OrderStatus, OrderType, PaymentStatus, SupplementTeamStatus } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Decimal } from '@prisma/client/runtime/library';
import { InsightsService } from '../insights/insights.service';
import { add, differenceInDays, getWeek, subWeeks } from 'date-fns';
import { QRCodeService } from '../qrcode/qrcode.service';
import { TeamsService } from '../teams/teams.service';
import { setTimeout } from 'timers';
import {
  currentDate,
  targetQuarterDate,
  upperQuarterDate,
} from '../utils/date';
import { PaymentServiceExtension } from '../payment/payment.service.extension';

@Injectable()
export class ScheduleServiceExtended {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
    private usersService: UsersService,
    private productsService: ProductsService,
    private notificationsService: NotificationsService,
    private insightsService: InsightsService,
    private qRCodeService: QRCodeService,
    private readonly teamsService: TeamsService,
    private readonly paymentServiceExtension: PaymentServiceExtension,
  ) {}

  async processCompleteOrders(
    pendingOrders: Array<{ id: string; minimumTreshold: Decimal }>,
  ) {
    try {
      pendingOrders.forEach(async (order) => {
        // get the captured payments
        const capturedPayments = await this.prisma.payment.aggregate({
          where: {
            orderId: order.id,
            status: 'CAPTURED',
            order: {
              type: 'RABBLE',
            },
          },
          _sum: {
            amount: true,
          },
        });

        if (+capturedPayments._sum.amount >= +order.minimumTreshold) {
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
      return true;
    } catch (error) {
      // log error
      console.log(error);
    }
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
    } catch (error) {
      // log error
      console.log(error);
    }
  }

  async createUserBasket(teamId: string, newOrderId: string) {
    try {
      // loop from the users basketc but keep track of the users you have done so that you won't need to do it twice
      const teamMembers = await this.prisma.basketC.findMany({
        where: {
          teamId,
        },
        include: {
          team: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              notificationToken: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      if (teamMembers.length > 0) {
        const tracker = [];
        for (let index = 0; index < teamMembers.length; index++) {
          const member = teamMembers[index];
          // if we have created basket for this user before, skip
          if (tracker.includes(member.userId)) {
            continue;
          }
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
                price: product.price,
              };

              // check for portioned products
              if (product.type == 'PORTIONED_SINGLE_PRODUCT') {
                setTimeout(async () => {
                  await this.paymentService.processPortionedProduct(
                    teamId,
                    newOrderId,
                    oldProduct.quantity,
                    oldProduct.productId,
                    oldProduct.userId,
                    productPrice,
                  );
                }, 4000 * index);
              }

              // add to basket
              await this.prisma.basket.create({
                data: newProduct,
              });

              // increment totalAmount
              totalAmount += +productPrice;
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
              type: notificationType.TEAM,
            });

            // record the user in the tracker so that the basket will not be created twice
            tracker.push(member.userId);
          }
        }
      }
    } catch (error) {
      // log error
      console.log(error);
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
        type: 'RABBLE',
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
        OR: [
          {
            type: 'RABBLE',
            deadline: {
              lte: new Date(),
            },
            minimumTreshold: {
              lte: this.prisma.order.fields.accumulatedAmount, // order is captured only when threshold has been met
            },
          },
          {
            type: 'SUPPLEMENT',
          },
        ],
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
        supplementTeamProducts: null,
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
        paymentIntentId: null,
        order: {
          status: 'PENDING',
        },
        OR: [
          {
            order: {
              type: 'RABBLE',
              deadline: {
                gte: new Date(),
              },
            },
          },
          // authorize the payment of the supplement first order after activation
          {
            order: {
              type: 'SUPPLEMENT',
              firstDelivery: true,
            },
          },
          // authorize the payment of the supplement order if the deadline has reached
          {
            order: {
              type: 'SUPPLEMENT',
              firstDelivery: false,
              deadline: {
                lte: new Date(),
              },
            },
          },
        ],
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
                partnerId: true,
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
      select: {
        id: true,
        teamId: true,
        deliveryDate: true,
        team: {
          select: {
            deliveryDay: true,
          },
        },
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
        updatedAt: {
          gte: last24hours,
        },
        status: 'CAPTURED',
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

  async handleInsightsUpdate(): Promise<boolean> {
    // get current week and year
    const currentDate = new Date();
    const currentWeek = getWeek(currentDate);
    const currentYear = currentDate.getFullYear();
    await this.insightsService.calculateNWRO(currentWeek, currentYear);
    await this.insightsService.calculateUniqueUsers(currentWeek, currentYear);
    return true;
  }

  async handleCustomerCollection(): Promise<boolean> {
    const fulfilledOrders = await this.prisma.order.findMany({
      where: {
        team: {
          partnerId: {
            not: null,
          },
        },
        status: 'PENDING_DELIVERY',
        collection: { none: {} },
      },
      select: {
        id: true,
        payments: {
          where: {
            status: 'CAPTURED',
          },
        },
      },
    });

    // create a collection for each team member and add their products
    for (const order of fulfilledOrders) {
      if (order.payments.length > 0) {
        for (const payment of order.payments) {
          // for each user that made payment, get there products
          const userProducts = await this.prisma.basket.findMany({
            where: {
              orderId: payment.orderId,
              userId: payment.userId,
              paymentStatus: 'CAPTURED',
            },
          });

          // for each user, create a collection for the user and add there products
          const collection = await this.prisma.collection.create({
            data: {
              orderId: payment.orderId,
              userId: payment.userId,
              dateOfCollection: new Date(),
              items: {
                createMany: {
                  data: userProducts.map((product) => ({
                    productId: product.productId,
                    quantity: product.quantity,
                  })),
                },
              },
            },
          });

          // generate qr code for the collection
          const qrCode = await this.qRCodeService.generateQRCode(collection.id);

          // update the collection to include the qr code
          await this.prisma.collection.update({
            where: {
              id: collection.id,
            },
            data: {
              qrCode: qrCode.qrCodeUrl,
            },
          });
        }
      }
    }

    return true;
  }

  async activateRabbleOrders(): Promise<boolean> {
    // get current week and year
    const ripeOrders = await this.prisma.order.findMany({
      select: {
        id: true,
        deadline: true,
      },
      where: {
        status: 'INACTIVE',
        type: 'RABBLE',
        deadline: {
          gte: new Date(),
        },
      },
    });

    for (const order of ripeOrders) {
      // if the deadline is less than 3 days, activate the order
      if (order.deadline.getTime() - new Date().getTime() < 3 * 86400 * 1000) {
        await this.prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: 'PENDING',
          },
        });
      }
    }

    return true;
  }

  async activatePreOrderTeams(): Promise<any> {
    // get supplement with preorder status
    const preOrderSupplements =
      await this.prisma.supplementTeamProducts.findMany({
        where: {
          status: 'PREORDER',
        },
        select: {
          id: true,
          teamId: true,
          orderTreashold: true,
          product: {
            select: {
              leadTime: true,
            },
          },
          team: {
            select: {
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
      });

    // check whether they have reached the threshold
    for (const supplement of preOrderSupplements) {
      // check if the product pre orders has reached the  20% of the threshold(which is the limit for founding members)
      if (supplement.team._count.members >= supplement.orderTreashold * 0.2) {
        // update the product status to active
        await this.teamsService.updateSupplementProductTeam({
          where: { id: supplement.id },
          data: { status: 'ACTIVE' },
        });

        // check whether they can met the next quarter delivery or not

        let alignmentDays = 0;
        const numberOfDaysInAQuarter = differenceInDays(
          upperQuarterDate,
          targetQuarterDate,
        );

        // check if they can meet the next quarter delivery considering the product lead time(unit is weeks)
        const interval = differenceInDays(
          targetQuarterDate,
          add(currentDate, { weeks: supplement.product.leadTime }),
        );
        // case 1: if the interval is less than 0, then they can't meet the next quarter delivery. we will need to give them alignment to the upper coming quarter
        if (interval < 0) {
          alignmentDays = differenceInDays(
            upperQuarterDate,
            add(currentDate, { weeks: supplement.product.leadTime }),
          );
          // case 2: if the interval is less than 7, we charge them for the next quarter only, no aligment
        } else if (interval < 7) {
          alignmentDays = numberOfDaysInAQuarter;
          // case 3: if the interval is greater than 7, we charge them for the next quarter and alignment that will get them to the next quarter
        } else if (interval > 7) {
          alignmentDays = numberOfDaysInAQuarter + interval;
        }

        // create the order for the team
        const orderData: IOrder = {
          teamId: supplement.teamId,
          status: OrderStatus.PENDING,
          type: OrderType.SUPPLEMENT,
          // we add 1 week extra to the leadtime for that to the duration for processing their payment
          deadline: subWeeks(upperQuarterDate, supplement.product.leadTime + 1),
          firstDelivery: true,
          deliveryDate: upperQuarterDate,
        };
        const { id } = await this.paymentService.createOrder(orderData);

        // create the basket
        await this.createSupplementUsersBasket(
          supplement.teamId,
          id,
          alignmentDays,
        );
      }
    }

    return true;
  }

  async createSupplementUsersBasket(
    teamId: string,
    orderId: string,
    duration: number,
  ): Promise<any> {
    // get the team members
    try {
      const teamMembers = await this.prisma.teamMember.findMany({
        where: {
          teamId,
          skipNextDelivery: false,
          subscriptionStatus: 'ACTIVE',
          status: 'APPROVED',
        },
        select: {
          id: true,
          role: true,
          userId: true,
        },
      });

      // get their basket
      for (const member of teamMembers) {
        // Check subscription status
        const hasActiveSubscription =
          await this.paymentServiceExtension.checkUserSubscriptionStatus(
            member.userId,
          );
        if (!hasActiveSubscription) {
          // Try to charge for subscription
          const subscriptionPayment =
            await this.paymentServiceExtension.handleYearlySubscription(
              member.userId,
            );

          if (!subscriptionPayment) {
            console.log('we were not able to charge the annual subscription');
            // Skip this user if subscription payment fails
            continue;
          }
        }
        // find the basket for the member
        const basket = await this.prisma.basketC.findMany({
          where: {
            teamId,
            userId: member.userId,
          },
          select: {
            capsulePerDay: true,
            productId: true,
            product: {
              select: {
                id: true,
                priceInfo: true,
                price: true,
                status: true,
                subUnit: true,
                supplementTeamProducts: {
                  select: {
                    foundingMembersDiscount: true,
                    earlyMembersDiscount: true,
                    status: true,
                  },
                },
              },
            },
          },
        });

        let totalAmount = 0; // amount to be paid by the user
        for (const item of basket) {
          if (item.product.status == 'OUT_OF_STOCK') {
            continue;
          }
          // get the dyanamic price for the product
          const priceDiscount = this.productsService.getPriceDiscount(
            item.product.priceInfo as unknown as IPricePlan[],
            teamMembers.length,
            item.product.supplementTeamProducts?.status ?? SupplementTeamStatus.ACTIVE,
          );
          const originalPrice = item.product.price;
          const priceWithDiscount = !priceDiscount
            ? originalPrice
            : +originalPrice - (+priceDiscount / 100) * +originalPrice;
          // a quarter is 90 days,  a single package we have is for 30 days, 
          // so we get the number of 30 days in a quarter, 3 pouches for a quarter 
          // for a user that takes 1 capsule per day
          // what if the product is measured in grams? 
          // i need to get the number of grams for 1month
          const productQuantity = item.product.subUnit == 'grams' ? (+item.capsulePerDay/5) * 3 : +item.capsulePerDay * 3;

          // create the subscription for this user
          let productPrice = +priceWithDiscount * productQuantity;
          let topupQuantity = 0;
          // check if there is alignment package
          if (duration > 91) {
            const topupDuration = duration - 91;
            topupQuantity = item.product.subUnit == 'grams' ? (+item.capsulePerDay/5) * Math.ceil(topupDuration / 30) : +item.capsulePerDay * Math.ceil(topupDuration / 30);
            productPrice += +priceWithDiscount * topupQuantity;
          }

          // if the user is a founding member, we will give them a discount
          if (member.role === 'FOUNDING_MEMBER') {
            productPrice =
              productPrice -
              (productPrice *
                +item.product?.supplementTeamProducts
                  ?.foundingMembersDiscount) /
                100;
          }

          if (member.role === 'EARLY_MEMBER') {
            productPrice =
              productPrice -
              (productPrice *
                +item.product?.supplementTeamProducts?.earlyMembersDiscount) /
                100;
          }

          const newProduct = {
            orderId,
            userId: member.userId,
            productId: item.productId,
            quantity: productQuantity,
            price: productPrice,
            capsulePerDay: item.capsulePerDay,
          };

          // add to basket
          await this.prisma.basket.create({
            data: newProduct,
          });

          // add alignment record to the basket
          if (topupQuantity > 0) {
            await this.prisma.topUpBasket.create({
              data: {
                ...newProduct,
                quantity: topupQuantity,
              },
            });
          }

          // increment totalAmount
          totalAmount += +productPrice;
        }

        // record the payment to be made by the user
        await this.paymentService.recordPayment({
          orderId,
          userId: member.userId,
          amount: totalAmount,
          status: PaymentStatus.PENDING,
        });
      }
      return true;
    } catch (error) {
      console.log(error);
    }
  }

  async createSupplementOrders() {
    // get all supplement active teams whose last order has expired
    const query = {
      type: OrderType.SUPPLEMENT,
      status: OrderStatus.PENDING,
      deliveryDate: {
        not: null,
        lte: new Date(),
      },
    };
    const expiredOrders = await this.prisma.order.findMany({
      where: {
        ...query,
      },
      select: {
        id: true,
        teamId: true,
        team: {
          select: {
            supplementTeamProducts: {
              select: {
                product: {
                  select: {
                    leadTime: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const order of expiredOrders) {
      // create the order for the team
      const orderData: IOrder = {
        teamId: order.teamId,
        status: OrderStatus.PENDING,
        type: OrderType.SUPPLEMENT,
        // we add 1 week extra to the leadtime for that to the duration for processing their payment
        deadline: subWeeks(
          upperQuarterDate,
          order.team.supplementTeamProducts.product.leadTime + 1,
        ),
        deliveryDate: upperQuarterDate,
      };
      const { id } = await this.paymentService.createOrder(orderData);

      // create the basket
      await this.createSupplementUsersBasket(order.teamId, id, 91);
    }
    // update the status of the expired orders to pending delivery
    await this.prisma.order.updateMany({
      where: {
        ...query,
      },
      data: {
        status: OrderStatus.PENDING_DELIVERY,
      },
    });
  }
}
