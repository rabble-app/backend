import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IProducerOrder } from '../lib/types';
import { endOfDay } from 'date-fns';
import { TeamStatus } from '@prisma/client';

@Injectable()
export class UsersServiceExtension {
  constructor(private prisma: PrismaService) {}

  async getProducerRecentOrders(
    producerId: string,
  ): Promise<IProducerOrder[] | null> {
    return await this.prisma.order.findMany({
      where: {
        team: {
          producerId: {
            equals: producerId,
            mode: 'insensitive',
          },
        },
      },
      select: {
        id: true,
        deliveryDate: true,
        status: true,
        accumulatedAmount: true,
        team: {
          select: {
            name: true,
            frequency: true,
            producer: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSupplementUserUpcomingDeliveries(
    userId: string,
  ){
    const endOfToday = endOfDay(new Date());

    return await this.prisma.order.findMany({
      where: {
        team: {
          members: {
            some: {
              userId: {
                equals: userId,
                mode: 'insensitive',
              },
            },
          }
        },
        deliveryDate: {
          gt: endOfToday,
        },
        status: {
          in: ['PENDING', 'PENDING_DELIVERY'],
        } 
      },
      select: {
        id: true,
        deliveryDate: true,
        team: {
          select: {
            name: true,
            producer: {
              select: {
                businessName: true,
              },
            },
            members:{
              where:{
                userId
              },
              select:{
                user:{
                  select:{
                    postalCode: true,
                    shipping:true
                  }
                }
              }
            }
          },
        },
        basket:{
          where:{
            userId,
          },
          select:{
            quantity: true,
            product:{
              select:{
                id: true,
                name: true,
                price: true,
                unitsOfMeasurePerSubUnit: true,
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserSupplementPlans(
    userId: string,
  ) {
    return await this.prisma.teamMember.findMany({
      where: {
        userId,
        status: TeamStatus.APPROVED, 
      },
      select: {
        id: true,
        subscriptionStatus: true,
        skipNextDelivery: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true,
            basket:{
              where:{
                userId,
              },
              select:{
                id: true,
                quantity: true,
                product:{
                  select:{
                    id: true,
                    name: true,
                    price: true,
                    unitsOfMeasurePerSubUnit: true,
                    rrp: true,
                    priceInfo: true,
                    capsuleInfo: true,
                    imageUrl: true,
                    producer: {
                      select: {
                        businessName: true,
                      },
                    }
                  }
                },
                capsulePerDay: true,   
              }
            },
            supplementTeamProducts:{
              select:{
               foundingMembersDiscount: true,
               status: true,
               orderTreashold: true,
              }
            },
            _count: {
              select: {
                 members: true,
               },
             },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
