import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma, Producer, Shipping, TeamMember } from '@prisma/client';
import { CreateProducerDto } from './dto/create-producer.dto';
import { DeliveryAddressDto } from './dto/delivery-address.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return await this.prisma.user.update({
      data,
      where,
    });
  }

  async createProducer(
    createProducerDto: CreateProducerDto,
  ): Promise<Producer> {
    return await this.prisma.producer.create({
      data: createProducerDto,
    });
  }

  async getProducers(offset = 0): Promise<Producer[] | null> {
    return await this.prisma.producer.findMany({
      skip: offset,
      take: 10,
      include: { user: true },
    });
  }

  async findProducer(
    producerWhereUniqueInput: Prisma.ProducerWhereUniqueInput,
  ): Promise<Producer | null> {
    return await this.prisma.producer.findUnique({
      where: producerWhereUniqueInput,
    });
  }

  async createDeliveryAddress(
    deliveryAddressDto: DeliveryAddressDto,
  ): Promise<Shipping> {
    return await this.prisma.shipping.create({
      data: deliveryAddressDto,
    });
  }

  async getOrderHistories(userId: string): Promise<TeamMember[]> {
    return await this.prisma.teamMember.findMany({
      where: {
        userId,
      },
      include: {
        team: {
          include: {
            orders: {
              include: {
                basket: {
                  where: {
                    userId,
                  },
                  include: {
                    product: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getSubscriptions(userId: string): Promise<TeamMember[]> {
    return await this.prisma.teamMember.findMany({
      where: {
        userId,
      },
      include: {
        team: {
          include: {
            orders: {
              where: {
                deadline: {
                  gte: new Date(),
                },
              },
              include: {
                basket: {
                  where: {
                    userId,
                  },
                  include: {
                    product: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getDeliveryAddress(
    shippingWhereUniqueInput: Prisma.ShippingWhereUniqueInput,
  ): Promise<Shipping | null> {
    return await this.prisma.shipping.findUnique({
      where: shippingWhereUniqueInput,
    });
  }

  async updateDeliveryAddress(params: {
    where: Prisma.ShippingWhereUniqueInput;
    data: Prisma.ShippingUpdateInput;
  }): Promise<Shipping> {
    const { where, data } = params;
    return await this.prisma.shipping.update({
      data,
      where,
    });
  }
}
