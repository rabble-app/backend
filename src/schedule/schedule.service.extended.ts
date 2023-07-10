import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { IScheduleTeam, PaymentStatus } from '../lib/types';
import { OrderStatus } from '@prisma/client';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ScheduleServiceExtended {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
    private usersService: UsersService,
    private productsService: ProductsService,
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

        if (capturedPayments._sum.amount >= order.minimumTreshold) {
          await this.updateOrderStatus(order.id, 'SUCCESSFUL');
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

  async createUserBasket(lastOrderId: string, newOrderId: string) {
    try {
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
