import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PostalCodeService {
  constructor(private prisma: PrismaService) {}

  async getAreaData(): Promise<{ name: string }[]> {
    try {
      return await this.prisma.postalCodeRegion.findMany({
        select: {
          id: true,
          name: true,
          postalCodeArea: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
        orderBy: [
          {
            name: 'asc',
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  }
}
