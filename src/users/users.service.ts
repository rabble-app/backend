import { DeliveryAddressDto } from './dto/delivery-address.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  User,
  Prisma,
  Producer,
  Shipping,
  TeamMember,
  BuyingTeam,
  TeamRequest,
  ProducerCategory,
  Search,
  SearchCount,
} from '@prisma/client';
import { AddProducerCategoryDto } from './dto/add-producer-category.dto';
import { SearchCategory } from 'src/lib/types';

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

  async getProducers(offset = 0): Promise<Producer[] | null> {
    return await this.prisma.producer.findMany({
      skip: offset,
      take: 10,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async findProducer(
    producerWhereUniqueInput: Prisma.ProducerWhereUniqueInput,
  ): Promise<Producer | null> {
    return await this.prisma.producer.findUnique({
      where: producerWhereUniqueInput,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
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
            host: {
              select: {
                firstName: true,
                lastName: true,
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
            host: {
              select: {
                firstName: true,
                lastName: true,
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

  async getMyTeams(userId: string): Promise<BuyingTeam[]> {
    return await this.prisma.buyingTeam.findMany({
      where: {
        hostId: userId,
      },
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
    });
  }

  async getMyRequests(userId: string): Promise<TeamRequest[]> {
    return await this.prisma.teamRequest.findMany({
      where: {
        userId,
      },
      include: {
        team: {
          select: {
            name: true,
            postalCode: true,
          },
        },
      },
    });
  }

  async updateProducer(params: {
    where: Prisma.ProducerWhereUniqueInput;
    data: Prisma.ProducerUpdateInput;
  }): Promise<Producer> {
    const { where, data } = params;
    return await this.prisma.producer.update({
      data,
      where,
    });
  }

  async addProducerCategory(
    addProducerCategoryDto: AddProducerCategoryDto,
  ): Promise<object> {
    return await this.prisma.producerCategory.createMany({
      data: addProducerCategoryDto.content,
    });
  }

  async removeProducerCategory(
    where: Prisma.ProducerCategoryWhereUniqueInput,
  ): Promise<ProducerCategory> {
    return await this.prisma.producerCategory.delete({
      where,
    });
  }

  async search(
    userId: string,
    keyword: string,
    category: SearchCategory,
  ): Promise<object[] | null> {
    let result = [];

    // save the search history
    await this.prisma.search.create({
      data: {
        userId,
        keyword,
        category,
      },
    });

    // check whether the search has been made before if so increment the count else add the search and put count to 1
    const searchFound = await this.prisma.searchCount.findFirst({
      where: {
        keyword,
      },
    });

    if (searchFound) {
      await this.prisma.searchCount.update({
        where: { id: searchFound.id },
        data: { count: { increment: 1 } },
      });
    } else {
      await this.prisma.searchCount.create({
        data: {
          keyword,
          category,
          count: 1,
        },
      });
    }

    // do the actual search
    if (category == 'SUPPLIER') {
      result = await this.prisma.producer.findMany({
        where: {
          businessName: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
      });
    } else if (category == 'PRODUCT') {
      result = await this.prisma.product.findMany({
        where: {
          name: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
      });
    } else {
      result = await this.prisma.buyingTeam.findMany({
        where: {
          name: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
      });
    }

    return result;
  }

  async recentSearches(userId: string): Promise<Search[] | null> {
    return await this.prisma.search.findMany({
      where: {
        userId,
      },
      distinct: ['keyword'],
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
  }

  async popularSearches(): Promise<SearchCount[] | null> {
    return await this.prisma.searchCount.findMany({
      orderBy: {
        count: 'desc',
      },
      take: 6,
    });
  }
}
