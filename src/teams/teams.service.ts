import { Injectable } from '@nestjs/common';
import { BuyingTeam, Prisma, TeamMember, TeamRequest } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

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
      include: {
        members: true,
      },
    });
  }

  async getPostalCodeTeams(postalCode: string): Promise<BuyingTeam[] | null> {
    return await this.prisma.buyingTeam.findMany({
      where: {
        postalCode,
      },
      include: {
        members: true,
      },
    });
  }

  async getTeams(offset = 0): Promise<BuyingTeam[] | null> {
    return await this.prisma.buyingTeam.findMany({
      skip: offset,
      take: 10,
      include: {
        members: true,
      },
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

  async teamRequestExist(
    userId: string,
    teamId: string,
  ): Promise<TeamRequest | null> {
    return await this.prisma.teamRequest.findFirst({
      where: {
        userId,
        teamId,
      },
    });
  }

  async sendJoinRequest(joinTeamDto: JoinTeamDto): Promise<TeamRequest | null> {
    const requestExist = await this.teamRequestExist(
      joinTeamDto.userId,
      joinTeamDto.teamId,
    );
    if (requestExist) return null;
    return await this.prisma.teamRequest.create({
      data: joinTeamDto,
    });
  }

  async getRequestData(id: string): Promise<TeamRequest | null> {
    return await this.prisma.teamRequest.findFirst({
      where: {
        id,
      },
    });
  }

  async updateRequest(
    updateRequestDto: UpdateRequestDto,
  ): Promise<TeamRequest> {
    if (updateRequestDto.status == 'APPROVED') {
      // get user data
      const result = await this.getRequestData(updateRequestDto.id);
      if (result) {
        await this.prisma.teamMember.create({
          data: {
            userId: result.userId,
            teamId: result.teamId,
            status: 'APPROVED',
          },
        });
      }
    }
    return await this.prisma.teamRequest.update({
      where: {
        id: updateRequestDto.id,
      },
      data: { status: updateRequestDto.status },
    });
  }

  async getTeamMembers(id: string): Promise<TeamMember[] | null> {
    return await this.prisma.teamMember.findMany({
      where: {
        teamId: id,
      },
      include: {
        user: true,
      },
    });
  }

  async getUserTeams(id: string): Promise<TeamMember[] | null> {
    return await this.prisma.teamMember.findMany({
      where: {
        userId: id,
      },
      include: {
        team: true,
      },
    });
  }
}
