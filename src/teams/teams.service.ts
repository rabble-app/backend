import { Injectable } from '@nestjs/common';
import {
  BuyingTeam,
  Order,
  Prisma,
  TeamMember,
  TeamRequest,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { PaymentService } from '../payment/payment.service';
import { UsersService } from '../users/users.service';
import { ITeamMember, Status } from '../lib/types';
import { NotificationsService } from '../notifications/notifications.service';
import { BulkInviteDto } from './dto/bulk-invite.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TeamsService {
  constructor(
    private prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly userService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly authService: AuthService,
  ) {}

  async createTeam(createTeamDto: CreateTeamDto) {
    const paymentIntentId = createTeamDto.paymentIntentId;
    const teamData = createTeamDto;
    delete teamData.paymentIntentId;

    const result = await this.prisma.buyingTeam.create({
      data: teamData,
    });

    // add the host as a user to the group
    const memberData = {
      teamId: result.id,
      userId: createTeamDto.hostId,
      status: Status.APPROVED,
    };
    await this.addTeamMember(memberData);

    // get producer's minimum threshold
    const producerInfo = await this.userService.findProducer({
      id: createTeamDto.producerId,
    });

    const currentDate = new Date();
    // add 6 days to the current date, order closes on the 7 day
    const nextWeekDate = new Date(
      currentDate.getTime() + 1 * 6 * 24 * 60 * 60 * 1000,
    );

    // get amount paid and add it to accumulator
    const paymentInfo = await this.prisma.payment.findFirst({
      where: {
        paymentIntentId,
      },
      select: {
        amount: true,
      },
    });

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
    return await this.prisma.teamMember.create({
      data: { ...teamData },
    });
  }

  async getProducerTeams(id: string): Promise<BuyingTeam[] | null> {
    return await this.prisma.buyingTeam.findMany({
      where: {
        producerId: id,
        isPublic:true,
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
        isPublic: true,
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
      where: {
        isPublic: true,
      },
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
        status: 'APPROVED',
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

  async quitBuyingTeam(
    where: Prisma.TeamMemberWhereUniqueInput,
  ): Promise<TeamMember> {
    return await this.prisma.teamMember.delete({
      where,
    });
  }

  async getTeamInfo(id: string): Promise<BuyingTeam | null> {
    return await this.prisma.buyingTeam.findFirst({
      where: {
        id,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                imageUrl: true,
              },
            },
          },
        },
        host: {
          include:{
            shipping:true
          },
        },
      },
    });
  }

  async getTeamCurrentOrderStatus(teamId: string): Promise<Order | null> {
    return await this.prisma.order.findFirst({
      where: {
        teamId,
      },
      include: {
        basket: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async nudgeTeam(id: string): Promise<boolean> {
    const teamMembers = await this.prisma.teamMember.findMany({
      where: {
        teamId: id,
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            phone: true,
          },
        },
      },
    });
    if (teamMembers.length > 0) {
      teamMembers.forEach(async (member) => {
        // send sms
        await this.notificationsService.sendSMS(
          'Your host is looking after your items for you, return the favour by collecting them as promptly as possible',
          member.user.phone,
        );
      });
    }
    return true;
  }

  async bulkInvite(bulkInviteDto: BulkInviteDto): Promise<boolean | null> {
    if (bulkInviteDto.phones.length > 0) {
      bulkInviteDto.phones.forEach(async (phone) => {
        // generate token with jwt
        const token = this.authService.generateToken({
          phone,
          userId: bulkInviteDto.userId,
          teamId: bulkInviteDto.teamId,
        });

        // store invite info
        await this.prisma.invite.create({
          data: {
            teamId: bulkInviteDto.teamId,
            userId: bulkInviteDto.userId,
            phone,
            token,
          },
        });

        // update the link to include the token
        const url = `${bulkInviteDto.link}?token=${token}`;

        // send to user
        const message = `Hi, someone is inviting you to join a buying team at Rabble, click the link to get started: ${url}`;

        // send the message to user
        await this.notificationsService.sendSMS(message, phone);
      });
    }
    return true;
  }

  async verifyInvite(token: string): Promise<boolean | object> {
    const returnValue = false;
    const data = this.authService.decodeToken(token);
    if (!data) return returnValue;
    // confirm that we have that record
    return await this.prisma.invite.findFirst({
      where: {
        userId: data.userId,
        phone: data.phone,
        teamId: data.teamId,
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
}
