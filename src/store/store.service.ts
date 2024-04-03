import { Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { PrismaService } from '../prisma.service';
import { OpenHours, Partner, Prisma } from '@prisma/client';
import { CreateOpenHoursDto } from './dto/create-open-hours.dto';

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
}
