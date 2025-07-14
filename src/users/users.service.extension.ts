import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IProducerOrder } from '../lib/types';
import { startOfDay } from 'date-fns';
import { TeamStatus, TopUpType } from '@prisma/client';

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

  async getSupplementUserUpcomingDeliveries(userId: string) {
    const startOfToday = startOfDay(new Date());

    const orders = await this.prisma.order.findMany({
      where: {
        team: {
          members: {
            some: {
              userId: {
                equals: userId,
                mode: 'insensitive',
              },
            },
          },
        },
        deliveryDate: {
          gte: startOfToday,
        },
        status: {
          in: ['PENDING', 'PENDING_DELIVERY'],
        },
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
            members: {
              where: {
                userId,
              },
              select: {
                user: {
                  select: {
                    postalCode: true,
                    shipping: {
                      select: {
                        buildingNo: true,
                        address: true,
                        address2: true,
                        city: true,
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        basket: {
          where: {
            userId,
          },
          select: {
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unitsOfMeasurePerSubUnit: true,
                imageUrl: true,
                poucheSize: true,
              },
            },
          },
        },
        topUpBasket: {
          where: {
            userId,
          },
          select: {
            quantity: true,
            price: true,
            deliveryDate: true,
            type: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                unitsOfMeasurePerSubUnit: true,
                imageUrl: true,
                poucheSize: true,
                alignmentPoucheSize: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the response to the desired format
    const transformedOrders = [];
    
    for (const order of orders) {
      const user = order.team.members[0]?.user;
      const shipping = user?.shipping;
      
      // Add regular basket items
      for (const basketItem of order.basket) {
        transformedOrders.push({
          orderId: order.id,
          type: 'Drop',
          deliveryDate: order.deliveryDate,
          user: {
            postalCode: user?.postalCode || null,
            buildingNo: shipping?.buildingNo || null,
            address: shipping?.address || null,
            address2: shipping?.address2 || null,
            city: shipping?.city || null,
            country: shipping?.country || null,
          },
          product: {
            name: basketItem.product.name,
            quantity: basketItem.quantity,
            price: basketItem.price,
            unitsOfMeasurePerSubUnit: basketItem.product.unitsOfMeasurePerSubUnit,
            imageUrl: basketItem.product.imageUrl,
            poucheSize: basketItem.product.poucheSize,
          },
        });
      }

      // Add top-up basket items
      for (const topUpItem of order.topUpBasket) {
        transformedOrders.push({
          orderId: order.id,
          type: topUpItem.type === TopUpType.ALIGNMENT ? 'Alignment' : 'Top-Up',
          deliveryDate: topUpItem.deliveryDate,
          user: {
            postalCode: user?.postalCode || null,
            buildingNo: shipping?.buildingNo || null,
            address: shipping?.address || null,
            address2: shipping?.address2 || null,
            city: shipping?.city || null,
            country: shipping?.country || null,
          },
          product: {
            name: topUpItem.product.name,
            quantity: topUpItem.quantity,
            price: topUpItem.price,
            unitsOfMeasurePerSubUnit: topUpItem.product.unitsOfMeasurePerSubUnit,
            imageUrl: topUpItem.product.imageUrl,
            poucheSize: topUpItem.product.alignmentPoucheSize,
          },
        });
      }
    }

    // Group by delivery date
    const groupedDeliveries: Record<string, { 
      deliveryDate: string; 
      user: {
        postalCode: string | null;
        buildingNo: string | null;
        address: string | null;
        address2: string | null;
        city: string | null;
        country: string | null;
      };
      deliveries: any[] 
    }> = {};
    
    for (const delivery of transformedOrders) {
      const deliveryDateKey = delivery.deliveryDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      if (!groupedDeliveries[deliveryDateKey]) {
        groupedDeliveries[deliveryDateKey] = {
          deliveryDate: deliveryDateKey,
          user: delivery.user,
          deliveries: []
        };
      }
      
      // Remove user object from individual delivery since it's now at the group level
      const { user, ...deliveryWithoutUser } = delivery;
      groupedDeliveries[deliveryDateKey].deliveries.push(deliveryWithoutUser);
    }

    // Split deliveries when there are more than 2 for a date
    const result: Array<{
      deliveryDate: string;
      user: {
        postalCode: string | null;
        buildingNo: string | null;
        address: string | null;
        address2: string | null;
        city: string | null;
        country: string | null;
      };
      deliveries: any[];
    }> = [];

    for (const [dateKey, group] of Object.entries(groupedDeliveries)) {
      const deliveries = group.deliveries;
      
      // If there are 2 or fewer deliveries, keep as is
      if (deliveries.length <= 2) {
        result.push({
          deliveryDate: group.deliveryDate,
          user: group.user,
          deliveries: deliveries
        });
      } else {
        // Split deliveries into chunks of 2
        for (let i = 0; i < deliveries.length; i += 2) {
          const chunk = deliveries.slice(i, i + 2);
          result.push({
            deliveryDate: group.deliveryDate,
            user: group.user,
            deliveries: chunk
          });
        }
      }
    }

    // Sort by delivery date
    return result.sort((a, b) => 
      new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
    );
  }

  async getUserSupplementPlans(userId: string) {
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
            basket: {
              where: {
                userId,
              },
              select: {
                id: true,
                quantity: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    unitsOfMeasurePerSubUnit: true,
                    rrp: true,
                    priceInfo: true,
                    imageUrl: true,
                    producer: {
                      select: {
                        businessName: true,
                      },
                    },
                  },
                },
                capsulePerDay: true,
                price: true,
                pricePerCount: true,
                discount: true,
              },
            },
            supplementTeamProducts: {
              select: {
                foundingMembersDiscount: true,
                earlyMembersDiscount: true,
                status: true,
                orderTreashold: true,
              },
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

  async getSingleSupplementPlans(id: string, userId: string) {
    const teamMember = await this.prisma.teamMember.findFirst({
      where: {
        id,
        status: TeamStatus.APPROVED,
      },
      select: {
        id: true,
        subscriptionStatus: true,
        skipNextDelivery: true,
        userId: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true,
            basket: {
              where: {
                userId,
              },
              select: {
                id: true,
                quantity: true,
                product: {
                  select: {
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
                    },
                  },
                },
                capsulePerDay: true,
                price: true,
                pricePerCount: true,
                discount: true,
              },
            },
            supplementTeamProducts: {
              select: {
                foundingMembersDiscount: true,
                earlyMembersDiscount: true,
                status: true,
                orderTreashold: true,
              },
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

    if (!teamMember) return null;

    const latestOrder = await this.prisma.order.findFirst({
      where: {
        teamId: teamMember.team.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        deadline: true,
      },
    });

    return {
      ...teamMember,
      team: {
        ...teamMember.team,
        latestOrder,
      },
    };
  }

  async hasActiveSupplementTeam(userId: string): Promise<boolean> {
    const teamRecord = await this.prisma.teamMember.findFirst({
      where: {
        userId,
        status: TeamStatus.APPROVED,
        team: {
          supplementTeamProducts: {
            status: 'ACTIVE'
          },
        },
      },
    });

    if (!teamRecord) return false;

    return true;
  }
}
