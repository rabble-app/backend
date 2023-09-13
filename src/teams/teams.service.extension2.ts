import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TeamsServiceExtension2 {
  constructor(
    private prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  async verifyInvite(token: string): Promise<boolean | object> {
    const returnValue = false;
    const data = this.authService.decodeToken(token);
    if (!data) return returnValue;

    // confirm that we have that record
    const record = await this.checkIfInviteExist(data);
    if (!record) return returnValue;

    // mark invite link as used
    await this.prisma.invite.update({
      where: {
        id: record.id,
      },
      data: {
        status: 'APPROVED',
      },
    });

    // get team info
    const team = await this.prisma.buyingTeam.findFirst({
      where: {
        id: record.teamId,
      },
    });

    // get producer info
    const producer = await this.userService.findProducer({
      id: team.producerId,
    });

    // return current order id
    const recentOrder = await this.returnCurrentOrder(record.teamId);

    record['teamName'] = team.name;
    record['producerInfo'] = producer;
    record['orderId'] = recentOrder.id;
    return record;
  }

  async checkIfInviteExist(data: {
    userId: string;
    phone: string;
    teamId: string;
  }): Promise<{ phone: string; teamId: string; id: string }> {
    return await this.prisma.invite.findFirst({
      where: {
        userId: data.userId,
        phone: data.phone,
        teamId: data.teamId,
        status: 'PENDING',
      },
      select: {
        id: true,
        phone: true,
        teamId: true,
      },
    });
  }

  async returnCurrentOrder(teamId: string): Promise<{ id: string }> {
    return await this.prisma.order.findFirst({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
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
