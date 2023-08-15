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
import { UsersService } from '../users/users.service';

@Injectable()
export class TeamsServiceExtension {
  constructor(
    private prisma: PrismaService,
    private readonly teamsService: TeamsService,
    private readonly notificationsService: NotificationsService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async updateRequest(
    updateRequestDto: UpdateRequestDto,
  ): Promise<TeamRequest | boolean> {
    // get user data
    const result = await this.teamsService.getRequestData(updateRequestDto.id);
    if (result) {
      // check if member already exist
      const memberExist = await this.prisma.teamMember.findFirst({
        where: {
          userId: result.userId,
          teamId: result.teamId,
        },
      });
      if (memberExist) {
        return await this.prisma.teamRequest.findFirst({
          where: {
            id: updateRequestDto.id,
          },
        });
      }
      if (updateRequestDto.status == 'APPROVED') {
        await this.prisma.teamMember.create({
          data: {
            userId: result.userId,
            teamId: result.teamId,
            status: 'APPROVED',
          },
        });
      }
      return await this.prisma.teamRequest.update({
        where: {
          id: updateRequestDto.id,
        },
        data: { status: updateRequestDto.status },
      });
    } else {
      return false;
    }
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
          where: {
            status: 'PENDING',
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { orders: true },
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
    const order = await this.prisma.order.findFirst({
      where: {
        id,
      },
    });
    // check whether 24 hours has passed after last nudge
    if (
      order &&
      order.lastNudge != null &&
      +Date.now() <
        +new Date(new Date(order.lastNudge).getTime() + 60 * 60 * 24 * 1000)
    ) {
      return false;
    } else {
      const teamMembers = await this.prisma.teamMember.findMany({
        where: {
          teamId: order.teamId,
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
      // update date for the lastnudge
      await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          lastNudge: new Date(),
        },
      });
      return true;
    }
  }

  async bulkInvite(bulkInviteDto: BulkInviteDto): Promise<boolean | object> {
    if (bulkInviteDto.phones.length > 0) {
      const senderInfo = await this.usersService.findUser({
        id: bulkInviteDto.userId,
      });
      const sender = senderInfo.firstName
        ? `${senderInfo.firstName} ${senderInfo.lastName}`
        : 'Someone';
      for (let index = 0; index < bulkInviteDto.phones.length; index++) {
        const phone = bulkInviteDto.phones[index];
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
        const message = `${sender} is inviting you to join his buying team on Rabble, click the link to get started: ${url}`;
        // send the message to user
        const feedback = await this.notificationsService.sendSMS(
          message,
          phone,
        );
        if (!feedback) return false;
      }
    } else {
      return false;
    }
    return true;
  }
}
