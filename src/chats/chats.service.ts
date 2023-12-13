import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { PrismaService } from '../../src/prisma.service';
import { IGetChat } from '../../src/lib/types';
import { NotificationsService } from 'src/notifications/notifications.service';
import { TeamsServiceExtension } from 'src/teams/teams.service.extension';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatsService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationsService,
    private readonly teamsServiceExtension: TeamsServiceExtension,
    private readonly usersService: UsersService,
  ) {}
  async create(createChatDto: CreateChatDto, userId: string) {
    // send notification
    const teamMembers = await this.teamsServiceExtension.getAllTeamUsers(
      createChatDto.teamId,
    );

    if (teamMembers.length > 0) {
      // get sender's name
      const sender = await this.usersService.findUser({
        id: userId,
      });
      const title = `${sender.firstName} sent message in ${teamMembers[0].team.name}' team`;
      teamMembers.forEach(async (member) => {
        // don't send notification to the message owner
        if (userId != member.userId) {
          await this.notificationService.createNotification({
            title,
            text: createChatDto.text,
            userId: member.userId,
            teamId: member.teamId,
            notficationToken: member.user.notificationToken,
          });
        }
      });
    }
    return await this.prisma.chat.create({
      data: {
        ...createChatDto,
        userId,
      },
    });
  }

  async findAll(iGetChat: IGetChat, userId: string) {
    const offset = iGetChat.offset ?? 0;
    const condition: { teamId: string; producerId?: string; userId?: string } =
      {
        teamId: iGetChat.teamId,
      };
    if (iGetChat.producerId) {
      condition['producerId'] = iGetChat.producerId;
      condition['userId'] = userId;
    }
    return await this.prisma.chat.findMany({
      where: {
        ...condition,
      },
      select: {
        userId: true,
        text: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        producer: {
          select: {
            businessName: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
        createdAt: true,
      },
      skip: +offset,
      take: 30,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUserBuyingTeamChats(userId: string) {
    return await this.prisma.teamMember.findMany({
      where: {
        userId,
        status: 'APPROVED',
      },
      select: {
        team: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
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
          },
        },
      },
    });
  }
}
