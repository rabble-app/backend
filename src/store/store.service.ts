import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { PrismaService } from '../prisma.service';
import {
  OpenHours,
  Partner,
  Prisma,
  OrderConfirmationStatus,
} from '@prisma/client';
import { CreateOpenHoursDto } from './dto/create-open-hours.dto';
import { startOfDay, endOfDay } from 'date-fns';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class StoreService {
  constructor(
    private prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createStore(
    userId: string,
    createStoreDto: CreateStoreDto,
  ): Promise<Partner> {
    const result = await this.prisma.partner.create({
      data: {
        userId,
        ...createStoreDto,
      },
    });

    // update the onboarding stage
    await this.usersService.updateUser({
      where: { id: userId },
      data: { onboardingStage: 1 },
    });

    return result;
  }

  async findStore(
    partnerWhereUniqueInput: Prisma.PartnerWhereUniqueInput,
  ): Promise<Partner | null> {
    return await this.prisma.partner.findUnique({
      where: partnerWhereUniqueInput,
    });
  }

  async getStoreOpenHours(
    openHoursWhereUniqueInput: Prisma.OpenHoursWhereUniqueInput,
  ): Promise<OpenHours | null> {
    return await this.prisma.openHours.findUnique({
      where: openHoursWhereUniqueInput,
    });
  }

  async createStoreOpenHours(
    createOpenHoursDto: CreateOpenHoursDto,
    userId: string,
  ): Promise<OpenHours> {
    const result = await this.prisma.openHours.create({
      data: {
        partnerId: createOpenHoursDto.storeId,
        type: createOpenHoursDto.type,
        CustomOpenHours:
          createOpenHoursDto.type != 'ALL_THE_TIME'
            ? {
                createMany: {
                  data: createOpenHoursDto.customOpenHours,
                },
              }
            : undefined,
      },
    });
    // update the onboarding stage
    await this.usersService.updateUser({
      where: { id: userId },
      data: { onboardingStage: 3 },
    });
    return result;
  }

  async updateStore(params: {
    where: Prisma.PartnerWhereUniqueInput;
    data: Prisma.PartnerUpdateInput;
  }): Promise<Partner> {
    const { where, data } = params;
    return await this.prisma.partner.update({
      data,
      where,
    });
  }

  async getStoreDeliveries({
    partnerId,
    skip,
    period,
    search,
    limit,
  }: {
    partnerId: string;
    skip?: number;
    period?: 'today' | 'upcoming' | 'past';
    search?: string;
    limit?: number;
  }) {
    const result = await this.prisma.order.findMany({
      where: this.getDeliveryFilter(partnerId, period, search),
      ...(skip && { skip }),
      ...(limit && { take: limit }),
      select: {
        id: true,
        accumulatedAmount: true,
        deliveryDate: true,
        createdAt: true,
        deadline: true,
        status: true,
        minimumTreshold: true,
        basket: {
          select: {
            id: true,
            price: true,
            quantity: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            producer: {
              select: {
                businessName: true,
                id: true,
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
          },
        },
      },
    });
    return result;
  }

  getDeliveryFilter(
    partnerId: string,
    period?: 'today' | 'upcoming' | 'past',
    search?: string,
  ): Prisma.OrderWhereInput {
    const periodFilter = this.getPeriodFilter(period);
    if (!search) {
      return {
        AND: [
          {
            team: {
              hostId: partnerId,
            },
          },
          periodFilter,
          {
            deliveryDate: {
              not: null,
            },
          },
        ],
      };
    } else {
      return {
        OR: [
          {
            AND: [
              {
                team: {
                  hostId: partnerId,
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              periodFilter,
              {
                deliveryDate: {
                  not: null,
                },
              },
            ],
          },
          {
            AND: [
              {
                team: {
                  hostId: partnerId,
                  producer: {
                    businessName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              periodFilter,
              {
                deliveryDate: {
                  not: null,
                },
              },
            ],
          },
        ],
      };
    }
  }

  getPeriodFilter(period = '') {
    const startOfToday = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());
    switch (period) {
      case 'today':
        return {
          deliveryDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        };
      case 'upcoming':
        return {
          deliveryDate: {
            gte: endOfToday,
          },
        };
      case 'past':
        return {
          deliveryDate: {
            lt: startOfToday,
          },
        };
      default:
        return {};
    }
  }

  async getStoreWithEmployees(storeId: string) {
    return await this.prisma.partner.findUnique({
      where: {
        id: storeId,
      },
      select: {
        id: true,
        userId: true,
        Employee: {
          select: {
            userId: true,
          },
        },
      },
    });
  }

  async isUserAnEmployee(userId: string, storeId: string) {
    const storeInfo = await this.getStoreWithEmployees(storeId);
    if (!storeInfo) {
      return false;
    }

    if (storeInfo.userId === userId) {
      return true;
    }
    return storeInfo.Employee.some((employee) => employee.userId === userId);
  }

  async getOrderWithGroupedBaskets(orderId: string) {
    const result = await this.prisma.$queryRaw<
      Array<{ product_id: string; total_quantity: number }>
    >`
      SELECT
        o.id,
        b.product_id,
        SUM(b.quantity) AS total_quantity
      FROM
        "orders" o
        JOIN "baskets" b ON o.id = b.order_id
      WHERE
        o.id = ${orderId}
      GROUP BY
        o.id, b.product_id
    `;

    if (result.length === 0) {
      throw new HttpException(
        `Order with ID ${orderId} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  async updateOrderConfirmation(
    confirmOrderDto: ConfirmOrderDto,
    confirmedBy: string,
    imageUrl?: string,
    imageKey?: string,
  ) {
    return await this.prisma.orderConfirmation.upsert({
      where: {
        orderId: confirmOrderDto.orderId,
      },
      update: {
        products: confirmOrderDto.products as unknown as Prisma.InputJsonArray,
        orderId: confirmOrderDto.orderId,
        confirmedBy,
        ...(imageUrl && { imageUrl }),
        ...(imageKey && { imageKey }),
        ...(confirmOrderDto.note && { note: confirmOrderDto.note }),
      },
      create: {
        orderId: confirmOrderDto.orderId,
        products: confirmOrderDto.products as unknown as Prisma.InputJsonArray,
        confirmedBy,
        imageKey,
        imageUrl,
        ...(confirmOrderDto.note && { note: confirmOrderDto.note }),
      },
    });
  }

  async updateOrderConfirmationStatus(
    orderId: string,
    status: OrderConfirmationStatus,
  ) {
    return await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        confirmationStatus: status,
      },
    });
  }

  async getStoreCustomerCollections({
    partnerId,
    skip,
    period,
    search,
    limit,
  }: {
    partnerId: string;
    skip?: number;
    period?: 'today' | 'upcoming' | 'past';
    search?: string;
    limit?: number;
  }) {
    return await this.prisma.collection.findMany({
      where: this.getCollectionFilter(partnerId, period, search),
      ...(skip && { skip }),
      ...(limit && { take: limit }),
      select: {
        id: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        order: {
          select: {
            team: {
              select: {
                id: true,
                name: true,
                producer: {
                  select: {
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
              },
            },
          },
        },
        dateOfCollection: true,
        status: true,
        items: {
          select: {
            id: true,
            amount: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });
  }

  getCollectionFilter(
    partnerId: string,
    period?: 'today' | 'upcoming' | 'past',
    search?: string,
  ): Prisma.CollectionWhereInput {
    const periodFilter = this.getCollectionPeriodFilter(period);
    if (!search) {
      return {
        AND: [
          {
            order: {
              team: {
                hostId: partnerId,
              },
            },
          },
          periodFilter,
        ],
      };
    } else {
      return {
        OR: [
          {
            AND: [
              {
                order: {
                  team: {
                    hostId: partnerId,
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              periodFilter,
            ],
          },
          {
            AND: [
              {
                user: {
                  firstName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                order: {
                  team: {
                    hostId: partnerId,
                  },
                },
              },
              periodFilter,
            ],
          },
          {
            AND: [
              {
                user: {
                  lastName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                order: {
                  team: {
                    hostId: partnerId,
                  },
                },
              },
              periodFilter,
            ],
          },
        ],
      };
    }
  }

  getCollectionPeriodFilter(period = '') {
    const startOfToday = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());
    switch (period) {
      case 'today':
        return {
          dateOfCollection: {
            gte: startOfToday,
            lte: endOfToday,
          },
        };
      case 'upcoming':
        return {
          dateOfCollection: {
            gte: endOfToday,
          },
        };
      case 'past':
        return {
          dateOfCollection: {
            lt: startOfToday,
          },
        };
      default:
        return {};
    }
  }

  async storeDeliveryAndCollectionValidation(
    storeId: string,
    offset: number,
    limit: number,
    period: string,
    userId: string,
  ): Promise<{
    store: Partner;
    skip: number;
    take: number;
  }> {
    const store = await this.findStore({ id: storeId });
    const skip = !isNaN(Number(offset)) ? +offset : 0;
    const take = !isNaN(Number(limit)) ? +limit : 10;
    if (period && !['today', 'upcoming', 'past'].includes(period))
      throw new HttpException(
        'Invalid period query, acceptable values are today | upcoming | past',
        HttpStatus.BAD_REQUEST,
      );
    if (!store || store.userId !== userId)
      throw new HttpException('Invalid store id', HttpStatus.BAD_REQUEST);

    return {
      store,
      skip,
      take,
    };
  }
}
