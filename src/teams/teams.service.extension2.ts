import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { ProductsService } from '../../src/products/products.service';

@Injectable()
export class TeamsServiceExtension2 {
  constructor(
    private prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async verifyInvite(token: string): Promise<boolean | object> {
    const returnValue = false;
    const data = this.authService.decodeToken(token);
    if (!data) return returnValue;

    // confirm that we have that record
    const record = await this.checkIfInviteExist(data);
    if (!record) return returnValue;

    // mark invite link as used
    await this.prisma.invite.update({
      where: {
        id: record.id,
      },
      data: {
        status: 'APPROVED',
      },
    });

    // get team info
    const team = await this.prisma.buyingTeam.findFirst({
      where: {
        id: record.teamId,
      },
    });

    // get producer info
    const producer = await this.userService.findProducer({
      id: team.producerId,
    });

    // return current order id
    const recentOrder = await this.returnCurrentOrder(record.teamId);

    record['teamName'] = team.name;
    record['producerInfo'] = producer;
    record['orderId'] = recentOrder.id;
    record['deadline'] = recentOrder.deadline;
    return record;
  }

  async checkIfInviteExist(data: {
    userId: string;
    phone: string;
    teamId: string;
  }): Promise<{ phone: string; teamId: string; id: string }> {
    return await this.prisma.invite.findFirst({
      where: {
        userId: data.userId,
        phone: data.phone,
        teamId: data.teamId,
        status: 'PENDING',
      },
      select: {
        id: true,
        phone: true,
        teamId: true,
      },
    });
  }

  async returnCurrentOrder(
    teamId: string,
  ): Promise<{ id: string; deadline: Date }> {
    return await this.prisma.order.findFirst({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        deadline: true,
      },
    });
  }

  async skipDelivery(id: string): Promise<object> {
    return await this.prisma.teamMember.update({
      where: {
        id,
      },
      data: {
        skipNextDelivery: true,
      },
    });
  }

  async getAllBuyingTeamSubscription(offset = 0): Promise<object> {
    const result = await this.prisma.$transaction([
      this.prisma.buyingTeam.count(),
      this.prisma.buyingTeam.findMany({
        skip: offset,
        take: 7,
        select: {
          id: true,
          host: {
            select: {
              lastName: true,
              firstName: true,
            },
          },
          name: true,
          postalCode: true,
          frequency: true,
          createdAt: true,
          nextDeliveryDate: true,
          producer: {
            select: {
              businessName: true,
            },
          },
          orders: {
            select: {
              status: true,
              accumulatedAmount: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return result;
  }

  async getOrders(status: OrderStatus, offset = 0): Promise<object> {
    const result = await this.prisma.$transaction([
      this.prisma.order.count({ where: { status } }),
      this.prisma.order.findMany({
        skip: offset,
        take: 7,
        where: {
          status,
        },
        select: {
          id: true,
          accumulatedAmount: true,
          minimumTreshold: true,
          deliveryDate: true,
          createdAt: true,
          deadline: true,
          status: true,
          team: {
            select: {
              name: true,
              postalCode: true,
              producer: {
                select: {
                  id: true,
                  businessName: true,
                  categories: {
                    select: {
                      category: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
              host: {
                select: {
                  firstName: true,
                  lastName: true,
                  shipping: {
                    select: {
                      buildingNo: true,
                      address: true,
                      city: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return result;
  }

  async getOrderInvoiceDetails(
    orderId: string,
    producerId: string,
  ): Promise<object> {
    const productLog = [];
    // get all producers product
    const products = await this.productsService.getProductNormal(producerId);
    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      const aggregations = await this.prisma.basket.aggregate({
        where: {
          orderId,
        },
        _sum: {
          quantity: true,
        },
      });
      productLog.push({
        productSku: product.id,
        name: product.name,
        unitsOfMeasurePerSubUnit: product.unitsOfMeasurePerSubUnit,
        measuresPerSubUnit: product.measuresPerSubUnit,
        quantityOfSubUnitPerOrder: product.quantityOfSubUnitPerOrder,
        cost: product.wholesalePrice,
        quantity: aggregations._sum.quantity,
        vat: product.vat,
      });
    }
    // check the order basket for each product and get the count
    const result = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        accumulatedAmount: true,
        createdAt: true,
        status: true,
        deliveryDate: true,
        deadline: true,
        team: {
          select: {
            name: true,
            producer: {
              select: {
                vat: true,
                paymentTerm: true,
                businessName: true,
                businessAddress: true,
                user: {
                  select: {
                    postalCode: true,
                  },
                },
              },
            },
            host: {
              select: {
                firstName: true,
                lastName: true,
                postalCode: true,
                shipping: {
                  select: {
                    buildingNo: true,
                    address: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    productLog.length > 0
      ? (result['productLog'] = productLog)
      : (result['productLog'] = []);

    return result;
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

  async ordersSearch(
    keyword: string,
    status: OrderStatus,
  ): Promise<object[] | null> {
    const result = await this.prisma.order.findMany({
      where: {
        OR: [
          {
            team: {
              name: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            status,
          },
          {
            team: {
              producer: {
                businessName: {
                  contains: keyword,
                  mode: 'insensitive',
                },
              },
            },
            status,
          },
          {
            team: {
              host: {
                firstName: {
                  contains: keyword,
                  mode: 'insensitive',
                },
              },
            },
            status,
          },
          {
            team: {
              host: {
                lastName: {
                  contains: keyword,
                  mode: 'insensitive',
                },
              },
            },
            status,
          },
          {
            team: {
              postalCode: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            status,
          },
        ],
      },
      select: {
        id: true,
        accumulatedAmount: true,
        deliveryDate: true,
        createdAt: true,
        deadline: true,
        status: true,
        minimumTreshold: true,
        team: {
          select: {
            name: true,
            postalCode: true,
            producer: {
              select: {
                businessName: true,
                categories: {
                  select: {
                    category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            host: {
              select: {
                firstName: true,
                lastName: true,
                shipping: {
                  select: {
                    buildingNo: true,
                    address: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return result;
  }

  async subscriptionSearch(keyword: string): Promise<object[] | null> {
    const result = await this.prisma.buyingTeam.findMany({
      where: {
        OR: [
          {
            host: {
              firstName: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          },
          {
            host: {
              lastName: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          },
          {
            postalCode: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        host: {
          select: {
            lastName: true,
            firstName: true,
          },
        },
        name: true,
        postalCode: true,
        frequency: true,
        createdAt: true,
        nextDeliveryDate: true,
        producer: {
          select: {
            businessName: true,
          },
        },
        orders: {
          select: {
            status: true,
            accumulatedAmount: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return result;
  }

  async orderStatusCount(): Promise<object> {
    const result = await this.prisma.$transaction([
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'PENDING_DELIVERY' } }),
      this.prisma.order.count({ where: { status: 'SUCCESSFUL' } }),
      this.prisma.order.count({ where: { status: 'FAILED' } }),
    ]);

    return result;
  }
}
