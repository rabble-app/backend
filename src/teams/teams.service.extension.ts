import { Injectable } from '@nestjs/common';
import {
  BuyingTeam,
  Order,
  Prisma,
  TeamMember,
  TeamRequest,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { UpdateRequestDto } from './dto/update-request.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { BulkInviteDto } from './dto/bulk-invite.dto';
import { AuthService } from '../auth/auth.service';
import { TeamsService } from './teams.service';

@Injectable()
export class TeamsServiceExtension {
  constructor(
    private prisma: PrismaService,
    private readonly teamsService: TeamsService,
    private readonly notificationsService: NotificationsService,
    private readonly authService: AuthService,
  ) {}

  async updateRequest(
    updateRequestDto: UpdateRequestDto,
  ): Promise<TeamRequest> {
    if (updateRequestDto.status == 'APPROVED') {
      // get user data
      const result = await this.teamsService.getRequestData(
        updateRequestDto.id,
      );
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
        team: {
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
        },
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
          include: {
            shipping: true,
          },
        },
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
        requests: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
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
      orderBy: {
        createdAt: 'desc',
      },
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
    const record = await this.prisma.invite.findFirst({
      where: {
        userId: data.userId,
        phone: data.phone,
        teamId: data.teamId,
      },
      select: {
        phone: true,
        teamId: true,
      },
    });

    if (!record) return returnValue;

    // get team info
    const team = await this.prisma.buyingTeam.findFirst({
      where: {
        id: record.teamId,
      },
    });

    // get producer info
    const producer = await this.prisma.producer.findFirst({
      where: {
        id: team.producerId,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
    // return current order id
    const recentOrder = await this.prisma.order.findFirst({
      where: {
        teamId: record.teamId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
      },
    });

    record['teamName'] = team.name;
    record['producerInfo'] = producer;
    record['orderId'] = recentOrder.id;
    return record;
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