import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { PrismaService } from '../../src/prisma.service';
import { IGetChat } from '../../src/lib/types';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}
  async create(createChatDto: CreateChatDto, userId: string) {
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
}
