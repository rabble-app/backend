import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { CreateOpenHoursDto } from './dto/create-open-hours.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { endOfDay, startOfDay } from 'date-fns';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import {
  OpenHours,
  Partner,
  Prisma,
  OrderConfirmationStatus,
  OrderCollectionStatus,
  User,
  Employee,
} from '@prisma/client';
import { UpdateOpenHoursDto } from './dto/update-open-hours.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { IStoreEmployee } from 'lib/types';

@Injectable()
export class StoreService {
  constructor(
    private prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createStore(
    userId: string,
    createStoreDto: CreateStoreDto,
  ): Promise<Partner> {
    const result = await this.prisma.partner.create({
      data: {
        userId,
        ...createStoreDto,
      },
    });

    // update the onboarding stage
    await this.usersService.updateUser({
      where: { id: userId },
      data: { onboardingStage: 1, postalCode: createStoreDto.postalCode },
    });

    return result;
  }

  async findStore(
    partnerWhereUniqueInput: Prisma.PartnerWhereUniqueInput,
  ): Promise<Partner | null> {
    return await this.prisma.partner.findUnique({
      where: partnerWhereUniqueInput,
    });
  }

  async getStoreOpenHours(
    openHoursWhereUniqueInput: Prisma.OpenHoursWhereUniqueInput,
  ): Promise<OpenHours | null> {
    return await this.prisma.openHours.findUnique({
      where: openHoursWhereUniqueInput,
      include: {
        CustomOpenHours: true,
      },
    });
  }

  async createStoreOpenHours(
    createOpenHoursDto: CreateOpenHoursDto,
    userId: string,
  ): Promise<OpenHours> {
    const result = await this.prisma.openHours.create({
      data: {
        partnerId: createOpenHoursDto.storeId,
        type: createOpenHoursDto.type,
        CustomOpenHours:
          createOpenHoursDto.type != 'ALL_THE_TIME'
            ? {
                createMany: {
                  data: createOpenHoursDto.customOpenHours,
                },
              }
            : undefined,
      },
    });
    // update the onboarding stage
    await this.usersService.updateUser({
      where: { id: userId },
      data: { onboardingStage: 3 },
    });
    return result;
  }

  async updateStore(params: {
    where: Prisma.PartnerWhereUniqueInput;
    data: Prisma.PartnerUpdateInput;
  }): Promise<Partner> {
    const { where, data } = params;
    return await this.prisma.partner.update({
      data,
      where,
    });
  }

  async updateStoreOpenHours(params: {
    where: Prisma.OpenHoursWhereUniqueInput;
    data: Prisma.OpenHoursUpdateInput;
  }): Promise<OpenHours> {
    const { where, data } = params;
    return await this.prisma.openHours.update({
      data,
      where,
    });
  }

  async getStoreDeliveries({
    partnerId,
    skip,
    period,
    search,
    limit,
  }: {
    partnerId: string;
    skip?: number;
    period?: 'today' | 'upcoming' | 'past';
    search?: string;
    limit?: number;
  }) {
    const result = await this.prisma.order.findMany({
      where: this.getDeliveryFilter(partnerId, period, search),
      ...(skip && { skip }),
      ...(limit && { take: limit }),
      select: {
        id: true,
        accumulatedAmount: true,
        deliveryDate: true,
        createdAt: true,
        deadline: true,
        status: true,
        minimumTreshold: true,
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            producer: {
              select: {
                businessName: true,
                id: true,
                categories: {
                  select: {
                    category: {
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
        _count: {
          select: { basket: true },
        },
      },
    });
    return result;
  }

  getDeliveryFilter(
    partnerId: string,
    period?: 'today' | 'upcoming' | 'past',
    search?: string,
  ): Prisma.OrderWhereInput {
    const periodFilter = this.getPeriodFilter(period);
    if (!search) {
      return {
        AND: [
          {
            team: {
              hostId: partnerId,
            },
          },
          periodFilter,
          {
            deliveryDate: {
              not: null,
            },
          },
        ],
      };
    } else {
      return {
        OR: [
          {
            AND: [
              {
                team: {
                  hostId: partnerId,
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              periodFilter,
              {
                deliveryDate: {
                  not: null,
                },
              },
            ],
          },
          {
            AND: [
              {
                team: {
                  hostId: partnerId,
                  producer: {
                    businessName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              periodFilter,
              {
                deliveryDate: {
                  not: null,
                },
              },
            ],
          },
        ],
      };
    }
  }

  getPeriodFilter(period = '') {
    const startOfToday = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());
    switch (period) {
      case 'today':
        return {
          deliveryDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        };
      case 'upcoming':
        return {
          deliveryDate: {
            gte: endOfToday,
          },
        };
      case 'past':
        return {
          deliveryDate: {
            lt: startOfToday,
          },
        };
      default:
        return {};
    }
  }

  async getStoreWithEmployees(storeId: string) {
    return await this.prisma.partner.findUnique({
      where: {
        id: storeId,
      },
      select: {
        id: true,
        userId: true,
        Employee: {
          select: {
            userId: true,
          },
        },
      },
    });
  }

  async isUserAnEmployee(userId: string, storeId: string) {
    const storeInfo = await this.getStoreWithEmployees(storeId);
    if (!storeInfo) {
      return false;
    }

    if (storeInfo.userId === userId) {
      return true;
    }
    return storeInfo.Employee.some((employee) => employee.userId === userId);
  }

  async checkStoreAuthorization(userId: string, storeId: string) {
    const isValidEmployee = await this.isUserAnEmployee(userId, storeId);
    if (!isValidEmployee) {
      throw new HttpException(
        'Invalid store id. User must be a store employee',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getOrderWithGroupedBaskets(orderId: string) {
    const result = await this.prisma.$queryRaw<
      Array<{ product_id: string; total_quantity: number; name: string }>
    >`
      SELECT
        o.id,
        b.product_id,
        SUM(b.quantity) AS total_quantity,
        p.name,
        p.measures_per_subunit,
        p.units_of_measure_per_subunit
      FROM
        "orders" o
        JOIN "baskets" b ON o.id = b.order_id
        LEFT JOIN "products" p ON b.product_id = p.id
      WHERE
        o.id = ${orderId}
      GROUP BY
        o.id, b.product_id, p.name, p.measures_per_subunit, p.units_of_measure_per_subunit;
    `;
    if (result.length === 0) {
      throw new HttpException(
        `Order with ID ${orderId} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  async updateOrderConfirmation(
    confirmOrderDto: ConfirmOrderDto,
    confirmedBy: string,
    imageUrl?: string,
    imageKey?: string,
  ) {
    return await this.prisma.orderConfirmation.upsert({
      where: {
        orderId: confirmOrderDto.orderId,
      },
      update: {
        products: confirmOrderDto.products as unknown as Prisma.InputJsonArray,
        orderId: confirmOrderDto.orderId,
        confirmedBy,
        ...(imageUrl && { imageUrl }),
        ...(imageKey && { imageKey }),
        ...(confirmOrderDto.note && { note: confirmOrderDto.note }),
      },
      create: {
        orderId: confirmOrderDto.orderId,
        products: confirmOrderDto.products as unknown as Prisma.InputJsonArray,
        confirmedBy,
        imageKey,
        imageUrl,
        ...(confirmOrderDto.note && { note: confirmOrderDto.note }),
      },
    });
  }

  async updateOrderConfirmationStatus(
    orderId: string,
    status: OrderConfirmationStatus,
  ) {
    return await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        confirmationStatus: status,
      },
    });
  }

  async getStoreCustomerCollections({
    partnerId,
    skip,
    period,
    search,
    limit,
  }: {
    partnerId: string;
    skip?: number;
    period?: 'today' | 'upcoming' | 'past';
    search?: string;
    limit?: number;
  }) {
    return await this.prisma.collection.findMany({
      where: this.getCollectionFilter(partnerId, period, search),
      ...(skip && { skip }),
      ...(limit && { take: limit }),
      select: this.getCollectionSelectAttributes(),
    });
  }

  getCollectionFilter(
    partnerId: string,
    period?: 'today' | 'upcoming' | 'past',
    search?: string,
  ): Prisma.CollectionWhereInput {
    const periodFilter = this.getCollectionPeriodFilter(period);
    if (!search) {
      return {
        AND: [
          {
            order: {
              team: {
                hostId: partnerId,
              },
            },
          },
          periodFilter,
        ],
      };
    } else {
      return {
        OR: [
          {
            AND: [
              {
                order: {
                  team: {
                    hostId: partnerId,
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              periodFilter,
            ],
          },
          {
            AND: [
              {
                user: {
                  firstName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                order: {
                  team: {
                    hostId: partnerId,
                  },
                },
              },
              periodFilter,
            ],
          },
          {
            AND: [
              {
                user: {
                  lastName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                order: {
                  team: {
                    hostId: partnerId,
                  },
                },
              },
              periodFilter,
            ],
          },
        ],
      };
    }
  }

  getCollectionPeriodFilter(period = '') {
    const startOfToday = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());
    switch (period) {
      case 'today':
        return {
          dateOfCollection: {
            gte: startOfToday,
            lte: endOfToday,
          },
        };
      case 'upcoming':
        return {
          dateOfCollection: {
            gte: endOfToday,
          },
        };
      case 'past':
        return {
          dateOfCollection: {
            lt: startOfToday,
          },
        };
      default:
        return {};
    }
  }

  async storeDeliveryAndCollectionValidation(
    storeId: string,
    offset: number,
    limit: number,
    period: string,
    userId: string,
  ): Promise<{
    store: Partner;
    skip: number;
    take: number;
  }> {
    const store = await this.findStore({ id: storeId });
    const skip = !isNaN(Number(offset)) ? +offset : 0;
    const take = !isNaN(Number(limit)) ? +limit : 10;
    if (period && !['today', 'upcoming', 'past'].includes(period))
      throw new HttpException(
        'Invalid period query, acceptable values are today | upcoming | past',
        HttpStatus.BAD_REQUEST,
      );
    await this.checkStoreAuthorization(userId, storeId);
    return {
      store,
      skip,
      take,
    };
  }

  async validateBasketSummary(
    orderId: string,
    products: ConfirmOrderDto['products'],
  ) {
    const orderProducts = await this.getOrderWithGroupedBaskets(orderId);
    let hasQuantityDeficit = false;
    for (const product of products) {
      const orderProduct = orderProducts.find(
        (orderProduct) => orderProduct.product_id === product.productId,
      );
      if (!orderProduct) {
        throw new HttpException('Invalid product id', HttpStatus.BAD_REQUEST);
      }
      if (+product.quantity < +orderProduct.total_quantity) {
        hasQuantityDeficit = true;
      }
    }
    if (products.length < orderProducts.length) {
      hasQuantityDeficit = true;
    }
    return !hasQuantityDeficit;
  }

  updateStoreOpenHoursData(
    openHourId: string,
    updateOpenHoursDto: UpdateOpenHoursDto,
  ): Prisma.OpenHoursUpdateInput {
    if (updateOpenHoursDto.type == 'ALL_THE_TIME') {
      return {
        type: updateOpenHoursDto.type,
      };
    } else {
      return {
        type: updateOpenHoursDto.type,
        CustomOpenHours: {
          deleteMany: {
            openHourId,
          },
          createMany: {
            data: [...updateOpenHoursDto.customOpenHours],
          },
        },
      };
    }
  }

  getCollectionSelectAttributes() {
    return {
      id: true,
      order: {
        select: {
          team: {
            select: {
              id: true,
              name: true,
              producer: {
                select: {
                  businessName: true,
                  categories: {
                    select: {
                      category: {
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
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      dateOfCollection: true,
      status: true,
      items: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              name: true,
              measuresPerSubUnit: true,
              unitsOfMeasurePerSubUnit: true,
            },
          },
        },
      },
      createdAt: true,
    };
  }

  async getCollectionDetails(storeId: string, collectionId: string) {
    const store = await this.findStore({ id: storeId });
    if (!store) {
      throw new HttpException('Invalid store id', HttpStatus.BAD_REQUEST);
    }
    return this.prisma.collection.findUnique({
      where: {
        id: collectionId,
        order: {
          team: {
            hostId: store.userId,
          },
        },
      },
      select: this.getCollectionSelectAttributes(),
    });
  }

  async updateCollectionStatus(
    storeId: string,
    collectionId: string,
    status: OrderCollectionStatus = 'COLLECTED',
  ) {
    const store = await this.validateStore(storeId);
    const collection = await this.prisma.collection.findUnique({
      where: {
        id: collectionId,
        order: {
          team: {
            hostId: store.userId,
          },
        },
      },
      select: {
        id: true,
        status: true,
      },
    });
    if (!collection) {
      throw new HttpException('Invalid collection id', HttpStatus.BAD_REQUEST);
    }
    const updated = await this.prisma.collection.update({
      where: {
        id: collectionId,
      },
      data: {
        status,
      },
    });
    return updated.status === 'COLLECTED';
  }

  async validateStore(storeId: string) {
    const store = await this.findStore({ id: storeId });
    if (!store) {
      throw new HttpException('Invalid store id', HttpStatus.BAD_REQUEST);
    }
    return store;
  }

  async addEmployeeToStore(
    storeId: string,
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<{ user: User; employee: Employee }> {
    // create user account for the employee
    const user = await this.usersService.createUser({
      ...createEmployeeDto,
      onboardingStage: 4,
      role: 'EMPLOYEE',
    });
    // add the employee to the store
    const employee = await this.prisma.employee.create({
      data: { userId: user.id, partnerId: storeId },
    });
    return {
      user,
      employee,
    };
  }

  async removeEmployeeFromStore(
    storeId: string,
    employeeId: string,
  ): Promise<Employee> {
    return await this.prisma.employee.delete({
      where: {
        id: employeeId,
        partnerId: storeId,
      },
    });
  }

  async getStoreEmployees(storeId: string): Promise<IStoreEmployee[]> {
    return await this.prisma.employee.findMany({
      where: {
        partnerId: storeId,
      },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
  }
}
