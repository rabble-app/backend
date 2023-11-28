import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class TeamsServiceExtension2 {
  constructor(
    private prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
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

  async returnCurrentOrder(teamId: string): Promise<{ id: string }> {
    return await this.prisma.order.findFirst({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
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

  async getAllBuyingTeamSubscription(offset = 0) {
    const result = await this.prisma.$transaction([
      this.prisma.buyingTeam.count(),
      this.prisma.buyingTeam.findMany({
        skip: offset,
        take: 7,
        select: {
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

  async getOrders(status: OrderStatus, offset = 0) {
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
}
