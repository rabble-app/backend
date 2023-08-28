import { Injectable } from '@nestjs/common';
import { BuyingTeam, Prisma, TeamMember, TeamRequest } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { PaymentService } from '../payment/payment.service';
import { UsersService } from '../users/users.service';
import { ITeamMember, Status, TeamMemberShip } from '../lib/types';
import { teamImages } from '../../src/utils';

@Injectable()
export class TeamsService {
  constructor(
    private prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly userService: UsersService,
  ) {}

  async createTeam(createTeamDto: CreateTeamDto) {
    const paymentIntentId = createTeamDto.paymentIntentId;
    const teamData = createTeamDto;
    delete teamData.paymentIntentId;
    let imageUrl = '';

    // get producer's minimum threshold
    const producerInfo = await this.userService.findProducer({
      id: createTeamDto.producerId,
    });

    // assign the buying team an image based on producer category
    if (producerInfo.categories && producerInfo.categories.length > 0) {
      const category = producerInfo.categories[0].category.name;
      if (teamImages.hasOwnProperty(category)) {
        if (typeof teamImages[category] == 'function') {
          imageUrl =
            teamImages[category]()[
              Math.floor(Math.random() * teamImages[category]().length)
            ];
        } else {
          imageUrl =
            teamImages[category][
              Math.floor(Math.random() * teamImages[category].length)
            ];
        }
      }
    }
    if (!imageUrl) {
      imageUrl =
        teamImages.General[
          Math.floor(Math.random() * teamImages.General.length)
        ];
    }

    const result = await this.prisma.buyingTeam.create({
      data: {
        imageUrl,
        ...teamData,
      },
    });

    // get amount paid and add it to accumulator
    const paymentInfo = await this.prisma.payment.findFirst({
      where: {
        paymentIntentId,
      },
      select: {
        amount: true,
      },
    });

    // add the host as a user to the group
    const memberData = {
      teamId: result.id,
      userId: createTeamDto.hostId,
      status: Status.APPROVED,
      role: TeamMemberShip.ADMIN,
    };
    await this.addTeamMember(memberData);

    const currentDate = new Date();
    // add 6 days to the current date, order closes on the 7 day
    const nextWeekDate = new Date(
      currentDate.getTime() + 1 * 6 * 24 * 60 * 60 * 1000,
    );

    // create order
    const orderData = {
      teamId: result.id,
      minimumTreshold: producerInfo.minimumTreshold,
      deadline: nextWeekDate,
      accumulatedAmount: paymentInfo.amount,
    };
    const orderResponse = await this.paymentService.createOrder(orderData);

    // update payment record
    const paymentData = {
      orderId: orderResponse.id,
      paymentIntentId,
    };

    await this.paymentService.updatePayment({
      where: { paymentIntentId },
      data: { ...paymentData },
    });
    result['orderId'] = orderResponse.id;
    return result;
  }

  async addTeamMember(teamData: ITeamMember): Promise<TeamMember | null> {
    return await this.prisma.teamMember.upsert({
      where: {
        team_unique_user: {
          teamId: teamData.teamId,
          userId: teamData.userId,
        },
      },
      update: {},
      create: { ...teamData },
    });
  }

  async getProducerTeams(id: string): Promise<BuyingTeam[] | null> {
    return await this.prisma.buyingTeam.findMany({
      where: {
        producerId: id,
        isPublic: true,
      },
      include: {
        members: true,
        producer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
        host: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getPostalCodeTeams(postalCode: string): Promise<BuyingTeam[] | null> {
    return await this.prisma.buyingTeam.findMany({
      where: {
        postalCode,
        isPublic: true,
      },
      include: {
        members: true,
        producer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
        host: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getTeams(offset = 0): Promise<BuyingTeam[] | null> {
    return await this.prisma.buyingTeam.findMany({
      skip: offset,
      take: 10,
      where: {
        isPublic: true,
      },
      include: {
        members: true,
        producer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
        host: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        requests: true,
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

  async deleteTeam(
    where: Prisma.BuyingTeamWhereUniqueInput,
  ): Promise<BuyingTeam> {
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

  async findBuyingTeam(
    buyingTeamWhereUniqueInput: Prisma.BuyingTeamWhereUniqueInput,
  ): Promise<BuyingTeam | null> {
    return await this.prisma.buyingTeam.findUnique({
      where: buyingTeamWhereUniqueInput,
    });
  }
}
