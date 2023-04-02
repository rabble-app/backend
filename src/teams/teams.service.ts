import { Injectable } from '@nestjs/common';
import { BuyingTeam, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async createTeam(createTeamDto: CreateTeamDto): Promise<BuyingTeam> {
    return await this.prisma.buyingTeam.create({
      data: createTeamDto,
    });
  }

  async getProducerTeams(id: string): Promise<BuyingTeam[] | null> {
    return await this.prisma.buyingTeam.findMany({
      where: {
        producerId: id,
      },
    });
  }

  async getPostalCodeTeams(postalCode: string): Promise<BuyingTeam[] | null> {
    return await this.prisma.buyingTeam.findMany({
      where: {
        postalCode,
      },
    });
  }

  async getTeams(offset = 0): Promise<BuyingTeam[] | null> {
    return await this.prisma.buyingTeam.findMany({
      skip: offset,
      take: 10,
    });
  }

  async updateTeam(params: {
    where: Prisma.BuyingTeamWhereUniqueInput;
    data: Prisma.BuyingTeamUpdateInput;
  }): Promise<BuyingTeam> {
    const { where, data } = params;
    return await this.prisma.buyingTeam.update({
      data,
      where,
    });
  }

  async deleteTeam(where: Prisma.UserWhereUniqueInput): Promise<BuyingTeam> {
    return await this.prisma.buyingTeam.delete({
      where,
    });
  }
}
