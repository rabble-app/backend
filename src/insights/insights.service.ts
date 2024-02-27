import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'prisma.service';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async calculateNWRO(week: number, year: number): Promise<void> {
    try {
      const buyingTeams = await this.prisma.buyingTeam.findMany({
        select: {
          frequency: true,
        },
      });
      let totalNWRO: Decimal = new Decimal(0.0);
      if (buyingTeams && buyingTeams.length) {
        for (let index = 0; index < buyingTeams.length; index++) {
          const team = buyingTeams[index];
          const nwro = this.getNWRO(team.frequency);
          totalNWRO = new Decimal(+totalNWRO + +nwro);
        }
      }
      await this.prisma.nWRO.create({
        data: {
          week,
          year,
          value: totalNWRO,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async calculateUniqueUsers(week: number, year: number): Promise<void> {
    try {
      const buyingMembers = await this.prisma.teamMember.findMany({
        select: {
          userId: true,
        },
        where: {
          status: 'APPROVED',
        },
      });
      const unique = [
        ...new Map(buyingMembers.map((m) => [m.userId, m])).values(),
      ];

      await this.prisma.uniqueUsers.create({
        data: {
          week,
          year,
          value: unique.length,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  getNWRO(frequency: number): Decimal {
    return new Decimal(604800 / frequency);
  }
}
