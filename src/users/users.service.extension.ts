import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IProducerOrder } from '../lib/types';

@Injectable()
export class UsersServiceExtension {
  constructor(private prisma: PrismaService) {}

  async getProducerRecentOrders(
    producerId: string,
  ): Promise<IProducerOrder[] | null> {
    return await this.prisma.order.findMany({
      where: {
        team: {
          producerId: {
            equals: producerId,
            mode: 'insensitive',
          },
        },
      },
      select: {
        id: true,
        deliveryDate: true,
        status: true,
        accumulatedAmount: true,
        team: {
          select: {
            name: true,
            frequency: true,
          },
        },
      },
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
