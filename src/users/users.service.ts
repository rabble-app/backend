import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma, Producer } from '@prisma/client';
import { CreateProducerDto } from './dto/create-producer.dto';

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

  async getProducers(): Promise<Producer[] | null> {
    return await this.prisma.producer.findMany();
  }

  async findProducer(
    producerWhereUniqueInput: Prisma.ProducerWhereUniqueInput,
  ): Promise<Producer | null> {
    return await this.prisma.producer.findUnique({
      where: producerWhereUniqueInput,
    });
  }
}
