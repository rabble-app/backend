import Stripe from 'stripe';
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
  ProducerCategory,
  Search,
  SearchCount,
  DeliveryAddress,
  BasketC,
  Payment,
} from '@prisma/client';
import { AddProducerCategoryDto } from './dto/add-producer-category.dto';
import {
  SearchCategory,
  ProducerWithCategories,
  UserWithProducerInfo,
} from '../../src/lib/types';
import { CreateDeliveryAreaDto } from './dto/create-delivery-area.dto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<UserWithProducerInfo | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        producer: {
          select: {
            id: true,
          },
        },
      },
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
    const result = await this.prisma.user.update({
      data,
      where,
    });

    // update stripe information too
    if (data.firstName && data.lastName) {
      await this.updateStripeCustomerInfo(result.stripeCustomerId, {
        firstName: result.firstName,
        lastName: result.lastName,
      });
    }
    return result;
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
        _count: {
          select: { buyingteams: true },
        },
      },
    });
  }

  async findProducer(
    producerWhereUniqueInput: Prisma.ProducerWhereUniqueInput,
  ): Promise<ProducerWithCategories | null> {
    return await this.prisma.producer.findUnique({
      where: producerWhereUniqueInput,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: { buyingteams: true },
        },
      },
    });
  }

  async createDeliveryAddress(
    deliveryAddressDto: DeliveryAddressDto,
  ): Promise<Shipping> {
    if (deliveryAddressDto.postalCode) {
      await this.updateUser({
        where: {
          id: deliveryAddressDto.userId,
        },
        data: {
          postalCode: deliveryAddressDto.postalCode,
        },
      });
      delete deliveryAddressDto.postalCode;
    }
    return await this.prisma.shipping.create({
      data: deliveryAddressDto,
    });
  }

  async getOrderHistories(userId: string): Promise<Payment[]> {
    return await this.prisma.payment.findMany({
      where: {
        userId,
      },
      include: {
        order: {
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
            team: {
              include: {
                producer: {
                  select: {
                    businessName: true,
                    businessAddress: true,
                  },
                },
                _count: {
                  select: { members: true },
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
            members: true,
            requests: true,
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
        host: true,
      },
    });
  }

  async getMyRequests(userId: string): Promise<Array<object>> {
    const finalArray = [];
    const myTeams = await this.prisma.buyingTeam.findMany({
      where: {
        hostId: userId,
      },
      include: {
        requests: {
          where: {
            status: 'PENDING',
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (myTeams.length > 0) {
      myTeams.forEach((team) => {
        if (team.requests.length > 0) {
          finalArray.push(...team.requests);
        }
      });
    }

    const myRequests = await this.prisma.teamRequest.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      include: {
        team: {
          select: {
            name: true,
            postalCode: true,
            imageUrl: true,
          },
        },
      },
    });

    finalArray.push(...myRequests);

    return finalArray;
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
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          _count: {
            select: { buyingteams: true },
          },
        },
      });
    } else if (category == 'PRODUCT') {
      const res = await this.prisma.productCategory.findFirst({
        where: {
          name: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        include: {
          products: {
            include: {
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
      if (res && res.products.length > 0) {
        result = res.products;
      } else {
        result = await this.prisma.product.findMany({
          where: {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          include: {
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
        });
      }
    } else {
      result = await this.prisma.buyingTeam.findMany({
        where: {
          name: {
            contains: keyword,
            mode: 'insensitive',
          },
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

  async addDeliveryArea(
    producerId: string,
    createDeliveryAreaDto: CreateDeliveryAreaDto,
  ): Promise<DeliveryAddress> {
    return await this.prisma.deliveryAddress.create({
      data: {
        producerId,
        location: createDeliveryAreaDto.location,
        type: createDeliveryAreaDto.type,
        cutOffTime: createDeliveryAreaDto.cutOffTime,
        customAddresses:
          createDeliveryAreaDto.type != 'WEEKLY'
            ? {
                createMany: {
                  data: createDeliveryAreaDto.customAreas,
                },
              }
            : undefined,
      },
    });
  }

  async getBasket(userId: string, teamId: string): Promise<BasketC[] | null> {
    let orderId = '';
    // get team latest order id
    if (teamId) {
      //Todo: abstract it out, a function like this exist in payment service
      const result = await this.prisma.order.findFirst({
        where: {
          teamId: teamId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      orderId = result.id;
    }
    return await this.prisma.basketC.findMany({
      where: {
        userId,
        teamId,
      },
      include: {
        product: {
          include: {
            partionedProducts: {
              select: {
                threshold: true,
                accumulator: true,
                id: true,
              },
              where: {
                teamId,
                orderId,
              },
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });
  }

  async createCustomer(phone: string): Promise<{ id: string } | null> {
    try {
      const params: Stripe.CustomerCreateParams = {
        phone,
      };
      const response = await stripe.customers.create(params);
      return {
        id: response.id,
      };
    } catch (error) {}
  }

  async updateStripeCustomerInfo(
    customerId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ): Promise<{ id: string } | null> {
    try {
      const params: Stripe.CustomerUpdateParams = {
        name: `${data.lastName} ${data.firstName}`,
      };
      return await stripe.customers.update(customerId, params);
    } catch (error) {}
  }

  async getProducersCategories(): Promise<
    { id: string; name: string }[] | null
  > {
    return await this.prisma.producerCategoryOption.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}
