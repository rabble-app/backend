import Stripe from 'stripe';
import { DeliveryAddressDto } from './dto/delivery-address.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
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
  BasketC,
  Payment,
} from '@prisma/client';
import { AddProducerCategoryDto } from './dto/add-producer-category.dto';
import {
  SearchCategory,
  ProducerWithCategories,
  UserWithProducerAndPartnerInfo,
} from '../lib/types';
import { parse } from 'postcode';

@Injectable()
export class UsersService {
  private readonly stripe: Stripe;
  constructor(
    private prisma: PrismaService,
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
    @Inject('LOGGER') private readonly logger: Logger,
  ) {
    this.stripe = new Stripe(this.parameters.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  async findUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<UserWithProducerAndPartnerInfo | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        paymentMethods: {
          where: {
            isDefault: true,
          },
        },
        producer: {
          select: {
            id: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            postalCode: true,
            stripeConnectId: true,
            openhour: {
              select: {
                type: true,
              },
            },
          },
        },
        employee: {
          select: {
            partner: {
              select: {
                id: true,
                name: true,
                postalCode: true,
                openhour: {
                  select: {
                    type: true,
                  },
                },
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        shipping: true,
        _count: {
          select: {
            employee: true,
          },
        },
        basketsC: {
          select: {
            productId: true
          },
        }
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
    delete data.phone;
    const result = await this.prisma.user.update({
      data,
      where,
    });

    // update stripe information too
    if (data.firstName && data.lastName && result.stripeCustomerId) {
      await this.updateStripeCustomerInfo(result.stripeCustomerId, {
        firstName: result.firstName,
        lastName: result.lastName,
      });
    }
    return result;
  }

  async getProducers(
    postalCode: string,
    offset = 0,
  ): Promise<Producer[] | null> {
    return await this.prisma.producer.findMany({
      where: {
        ...this.getProducerListConditions(postalCode),
        NOT: {
          businessName: {
            contains: 'Rabble Ltd',
          },
        },
      },
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

  getProducerListConditions(postalCode: string): Prisma.ProducerWhereInput {
    if (!postalCode) return null;
    const { area } = parse(postalCode);
    return {
      deliveryDays: {
        some: {
          regions: {
            some: {
              producerAreas: {
                some: {
                  area: {
                    code: {
                      equals: area,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
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
        user: {
          select: {
            phone: true,
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
    const userUpdateconditions: Prisma.UserUpdateInput = {};
    if (deliveryAddressDto.firstName) {
      userUpdateconditions.firstName = deliveryAddressDto.firstName;
    }
    if (deliveryAddressDto.lastName) {
      userUpdateconditions.lastName = deliveryAddressDto.lastName;
    }
    if (deliveryAddressDto.phone) {
      userUpdateconditions.phone = deliveryAddressDto.phone;
    }
    if (deliveryAddressDto.postalCode) {
      userUpdateconditions.postalCode = deliveryAddressDto.postalCode;
    }

    if (Object.keys(userUpdateconditions).length !== 0) {
      await this.updateUser({
        where: {
          id: deliveryAddressDto.userId,
        },
        data: {
          ...userUpdateconditions,
        },
      });
      delete deliveryAddressDto.firstName;
      delete deliveryAddressDto.lastName;
      delete deliveryAddressDto.phone;
      delete deliveryAddressDto.postalCode;
      delete deliveryAddressDto.channel;
    }
    return await this.prisma.shipping.create({
      data: deliveryAddressDto,
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
                    imageUrl: true,
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
                    imageUrl: true,
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
            basket: true,
          },
        },
      },
    });
  }

  async getMyTeams(userId: string): Promise<BuyingTeam[]> {
    return await this.prisma.buyingTeam.findMany({
      where: {
        hostId: userId,
      },
      include: {
        members: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
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
          createdAt: 'desc',
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

  async createStripeCustomer({
    phone,
    email,
  }: {
    phone?: string;
    email?: string;
  }): Promise<{ id: string } | null> {
    try {
      const params: Stripe.CustomerCreateParams = {};
      if (email) params['email'] = email;
      if (phone) params['phone'] = phone;
      const response = await this.stripe.customers.create(params);
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
      return await this.stripe.customers.update(customerId, params);
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

  async getStripeProfile(accountId: string): Promise<object> {
    return await this.stripe.accounts.retrieve(accountId);
  }
}
