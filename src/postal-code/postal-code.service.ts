import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  Prisma,
  ProducerDeliveryArea,
  ProducerDeliveryDay,
  ProducerDeliveryRegion,
} from '@prisma/client';
import {
  CreateDeliveryDayDto,
  DeliveryRegionDto,
} from './dto/create-delivery-days.dto';
import {
  IPostalCodeSearchResponse,
  IProducerDeliveryDaysInfo,
} from '../lib/types';

@Injectable()
export class PostalCodeService {
  constructor(private prisma: PrismaService) {}

  async searchPostalCodeData(
    keyword: string,
  ): Promise<IPostalCodeSearchResponse[]> {
    try {
      return await this.prisma.postalCodeRegion.findMany({
        where: {
          OR: [
            {
              name: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            {
              postalCodeArea: {
                some: {
                  name: {
                    contains: keyword,
                    mode: 'insensitive',
                  },
                },
              },
            },
            {
              postalCodeArea: {
                some: {
                  code: {
                    contains: keyword,
                    mode: 'insensitive',
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          postalCodeArea: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        orderBy: [
          {
            name: 'asc',
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  }

  async createDeliveryDays(
    producerId: string,
    createDeliveryDayDto: CreateDeliveryDayDto,
  ): Promise<boolean> {
    try {
      const deliveryDays = createDeliveryDayDto.days;
      const deliveryRegions = createDeliveryDayDto.regions;

      if (deliveryDays && deliveryDays.length) {
        deliveryDays.forEach(async (selectedDay) => {
          // store the delivery day for the producer if it does not exist
          const result = await this.prisma.producerDeliveryDay.upsert({
            where: {
              producerId_day: {
                producerId,
                day: selectedDay.name,
              },
            },
            update: {},
            create: {
              producerId,
              day: selectedDay.name,
              cutOffDay: selectedDay.cutOffDay,
              cutOffTime: selectedDay.cutOffTime,
            },
          });

          // add the regions and areas for this producer if it does not exist
          await this.addDeliveryAreas(result.id, deliveryRegions);
        });
      }

      return true;
    } catch (error) {
      // console.log(error);
    }
  }

  async getProducerDeliveryDays(
    producerId: string,
  ): Promise<IProducerDeliveryDaysInfo[]> {
    try {
      return await this.prisma.producerDeliveryDay.findMany({
        where: {
          producerId,
        },
        select: {
          id: true,
          day: true,
          cutOffDay: true,
          cutOffTime: true,
          regions: {
            select: {
              id: true,
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
              minimumOrder: true,
              producerAreas: {
                select: {
                  id: true,
                  area: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteProducerDeliveryRegion(
    regionId: string,
  ): Promise<ProducerDeliveryRegion> {
    try {
      return await this.prisma.producerDeliveryRegion.delete({
        where: {
          id: regionId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteProducerDeliveryArea(
    areaId: string,
  ): Promise<ProducerDeliveryArea> {
    try {
      return await this.prisma.producerDeliveryArea.delete({
        where: {
          id: areaId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async addDeliveryAreas(
    deliveryDayId: string,
    deliveryRegions: DeliveryRegionDto[],
  ): Promise<boolean> {
    try {
      deliveryRegions.forEach(async (selectedRegion) => {
        await this.prisma.producerDeliveryRegion.upsert({
          where: {
            deliveryDayId_regionId: {
              deliveryDayId,
              regionId: selectedRegion.regionId,
            },
          },
          update: {},
          create: {
            deliveryDayId,
            regionId: selectedRegion.regionId,
            minimumOrder: selectedRegion.minOrder,
            producerAreas: {
              createMany: {
                data: selectedRegion.areas,
              },
            },
          },
        });
      });
      return true;
    } catch (error) {
      console.log(error);
    }
  }

  async updateDeliveryDayInfo(params: {
    where: Prisma.ProducerDeliveryDayWhereUniqueInput;
    data: Prisma.ProducerDeliveryDayUpdateInput;
  }): Promise<ProducerDeliveryDay> {
    const { where, data } = params;
    return await this.prisma.producerDeliveryDay.update({
      data,
      where,
    });
  }
}
