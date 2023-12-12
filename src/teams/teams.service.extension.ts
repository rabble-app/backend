import { Inject, Injectable, forwardRef } from '@nestjs/common';
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
import {
  IOrderDeadline,
  Status,
  TeamMemberShip,
  TeamMemberWithUserAndTeamInfo,
} from '../lib/types';

@Injectable()
export class TeamsServiceExtension {
  constructor(
    private prisma: PrismaService,
    private readonly teamsService: TeamsService,
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => AuthService))
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
        await this.teamsService.addTeamMember({
          userId: result.userId,
          teamId: result.teamId,
          status: Status.APPROVED,
          role: TeamMemberShip.MEMBER,
        });

        // send notification
        await this.notificationsService.createNotification({
          title: 'Team Request Accepted',
          text: `Your request to join ${result.team.name} team has been approved`,
          userId: result.userId,
          teamId: result.teamId,
          notficationToken: result.user.notificationToken,
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
        role: 'MEMBER',
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
        role: 'MEMBER',
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
            basket: {
              where: {
                userId: id,
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
    const record = await this.prisma.teamMember.findFirst({
      where: {
        id: where.id,
      },
      include: {
        team: {
          select: {
            hostId: true,
          },
        },
      },
    });
    const result = await this.prisma.teamMember.delete({
      where,
    });
    if (record.team.hostId == record.userId) {
      // delete the buying team
      await this.teamsService.deleteTeam({ id: record.teamId });
    }
    return result;
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
                cardLastFourDigits: true,
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
        chats: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            text: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  async getTeamCurrentOrderStatus(
    teamId: string,
    trim = 'false',
  ): Promise<Order | IOrderDeadline> {
    let result: IOrderDeadline | PromiseLike<Order>;
    if (trim && trim == 'true') {
      result = await this.prisma.order.findFirst({
        where: {
          teamId,
        },
        select: {
          deadline: true,
          id: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      result = await this.prisma.order.findFirst({
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
          partionedProducts: {
            select: {
              accumulator: true,
              threshold: true,
              product: true,
              PartitionedProductUsersRecord: {
                select: {
                  amount: true, // remove later
                  quantity: true,
                  owner: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
    return result;
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
              notificationToken: true,
            },
          },
        },
      });
      if (teamMembers.length > 0) {
        const message =
          'Your host is looking after your items for you, return the favour by collecting them as promptly as possible';
        teamMembers.forEach(async (member) => {
          // send sms
          await this.notificationsService.sendSMS(message, member.user.phone);

          // send  push notification
          await this.notificationsService.createNotification({
            title: 'Collect your items',
            text: message,
            userId: member.userId,
            notficationToken: member.user.notificationToken,
          });
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

  async getAllTeamUsers(
    teamId: string,
  ): Promise<TeamMemberWithUserAndTeamInfo[] | null> {
    return await this.prisma.teamMember.findMany({
      where: {
        teamId,
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            notificationToken: true,
            id: true,
          },
        },
        team: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
