import { Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { PrismaService } from '../prisma.service';
import { OpenHours, Partner, Prisma } from '@prisma/client';
import { CreateOpenHoursDto } from './dto/create-open-hours.dto';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async createStore(
    userId: string,
    createStoreDto: CreateStoreDto,
  ): Promise<Partner> {
    return await this.prisma.partner.create({
      data: {
        userId,
        ...createStoreDto,
      },
    });
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
  ): Promise<OpenHours> {
    return await this.prisma.openHours.create({
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

  async getStoreDeliveries(
    partnerId: string,
    skip?: number,
    period?: 'today' | 'upcoming' | 'past',
  ) {
    const periodFilter = this.getPeriodFilter(period);
    const result = await this.prisma.order.findMany({
      where: {
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
      },
      ...(skip && { skip }),
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
}
