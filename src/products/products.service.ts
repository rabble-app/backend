import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {
  Product,
  ProductCategory,
  RecentlyViewed,
  SupplementTags,
  SupplementTeamProducts,
  SupplementTeamStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { RecentlyViewedProductDto } from './dto/recently-viewed-product.dto';
import {
  IPricePlan,
  ITeamWithOtherInfo,
  ProductApprovalStatus,
  ProductWithSupplementPayload,
} from '../../src/lib/types';
import { PaymentService } from '../../src/payment/payment.service';
import { UpdateProductStatusDto } from './dto/update-product-status';
import { Decimal } from '@prisma/client/runtime/library';
import { addQuarters, addWeeks, differenceInDays } from 'date-fns';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    return await this.prisma.product.create({
      data: createProductDto,
    });
  }

  async getProduct(
    id: string,
    teamId = '',
    userId = '',
  ): Promise<ProductWithSupplementPayload | null> {
    let orderId = '';
    let orderDeadline: Date;
    let deliveryDate: Date;
    let activePercentageDiscount = 0;
    let teamMemberCount = 0;
    let firstDelivery = false;
    let orderDate: Date;
    // get team latest order id
    if (teamId) {
      const result = await this.paymentService.getTeamLatestOrder(teamId);
      orderId = result?.id;
      orderDeadline = result?.deadline;
      deliveryDate = result?.deliveryDate;
      firstDelivery = result?.firstDelivery;
      orderDate = result?.createdAt;
    }
    const result = await this.prisma.product.findFirst({
      where: {
        id,
      },
      include: {
        producer: true,
        partionedProducts: {
          select: {
            accumulator: true,
            threshold: true,
            PartitionedProductUsersRecord: {
              select: {
                id: true,
                amount: true, // remove later
                quantity: true,
                owner: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
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
        supplementTeamProducts: {
          select: {
            orderTreashold: true,
            foundingMembersDiscount: true,
            earlyMembersDiscount: true,
            status: true,
            team: {
              select: {
                id: true,
                _count: {
                  select: {
                    members: {
                      where: {
                        status: 'APPROVED',
                      },
                    },
                  },
                },
                members: userId
                  ? {
                      where: {
                        status: 'APPROVED',
                        userId,
                      },
                      take: 1,
                      select: {
                        id: true,
                        role: true,
                      },
                    }
                  : undefined,
                // user basket if userId is provided
                basket: userId
                  ? {
                      where: {
                        userId,
                      },
                    }
                  : undefined,
              },
            },
          },
        },
      },
    });

    teamMemberCount = result?.supplementTeamProducts?.team?._count.members;
    if (teamId) {
      const priceInfo = result.priceInfo as unknown as IPricePlan[];
      const teamStatus =
        result?.supplementTeamProducts?.status ?? SupplementTeamStatus.ACTIVE;
      activePercentageDiscount = this.getPriceDiscount(
        priceInfo as unknown as IPricePlan[],
        teamMemberCount,
        teamStatus,
      );
      const priceWithDiscount = !activePercentageDiscount
        ? result.rrp
        : Number(
            (
              +result.rrp -
              (+activePercentageDiscount / 100) * +result.rrp
            ).toFixed(2),
          );

      // Add actual discounted value to each price plan
      if (priceInfo) {
        priceInfo.forEach((plan) => {
          const discountedValue = Number(
            (
              +result.rrp -
              (plan.percentageDiscount / 100) * +result.rrp
            ).toFixed(2),
          );
          plan['actualDiscountedValue'] = discountedValue;
        });
      }

      result['orderId'] = orderId;
      result['firstDelivery'] = firstDelivery;
      result['orderDeadline'] = orderDeadline;
      result['deliveryDate'] = deliveryDate;
      result['orderDate'] = orderDate;
      result['activePercentageDiscount'] = activePercentageDiscount;
      result['price'] = new Decimal(priceWithDiscount);
      result['pricePerCount'] = Number((+result.price / 90).toFixed(4));
      result['rrpPerCount'] = Number((+result.rrp / 90).toFixed(4));

      // Adjust pricePerCount and rrpPerCount for grams if applicable
      if (result.unitsOfMeasurePerSubUnit === 'grams' && result.gramsPerCount) {
        result['pricePerCount'] = Number(
          (result['pricePerCount'] / Number(result.gramsPerCount)).toFixed(4),
        );
        result['rrpPerCount'] = Number(
          (result['rrpPerCount'] / Number(result.gramsPerCount)).toFixed(4),
        );
      }

      result['discount'] = Math.abs(
        Number(((+result.price / +result.rrp - 1) * 100).toFixed(2)),
      );
      if (deliveryDate) {
        result['daysUntilNextDrop'] = differenceInDays(
          deliveryDate,
          new Date(),
        );
        // Check if firstDelivery is true but deliveryDate is in the past
        if (firstDelivery && deliveryDate < new Date()) {
          result['firstDelivery'] = false;
          result['deliveryDate'] = addWeeks(orderDeadline, result.leadTime + 1);
          result['daysUntilNextDrop'] = differenceInDays(
            result['deliveryDate'],
            new Date(),
          );
        }
        result['pochesRequired'] = Math.ceil(
          (result['daysUntilNextDrop'] *
            (result.unitsOfMeasurePerSubUnit === 'grams'
              ? +result.gramsPerCount
              : 1)) /
            +result.alignmentPoucheSize,
        );
        result['pricePerPoche'] = Number(
          (+result['pricePerCount'] * +result.alignmentPoucheSize).toFixed(4),
        );
        result['nextEditableDate'] = addQuarters(orderDeadline, 1);
      }
      if (priceInfo && priceInfo.length > 0) {
        // Calculate next discount level
        const nextDiscountLevel = priceInfo
          .sort((a, b) => (a.teamMemberCount > b.teamMemberCount ? 1 : -1))
          .find((plan) => plan.teamMemberCount > teamMemberCount);

        result['nextPriceDiscountLevel'] = nextDiscountLevel
          ? {
              membersNeeded:
                nextDiscountLevel.teamMemberCount - teamMemberCount,
              expectedDiscount: nextDiscountLevel.percentageDiscount,
            }
          : null;
      }
    }
    return result;
  }

  async getProducerProducts(
    id: string,
    teamId: string,
  ): Promise<ProductCategory[] | null> {
    const finalResult: ProductCategory[] = [];
    let orderId = '';
    // get team latest order id
    if (teamId) {
      const result = await this.paymentService.getTeamLatestOrder(teamId);
      orderId = result.id;
    }
    const result = await this.prisma.productCategory.findMany({
      include: {
        products: {
          where: {
            producerId: id,
            approvalStatus: ProductApprovalStatus.APPROVED,
          },
          include: {
            partionedProducts: {
              select: {
                threshold: true,
                accumulator: true,
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

    for (let index = 0; index < result.length; index++) {
      const category = result[index];
      if (category.products.length > 0) {
        finalResult.push(category);
      }
    }

    return finalResult;
  }

  async recordRecentlyViewed(
    recentlyViewedProductDto: RecentlyViewedProductDto,
  ): Promise<RecentlyViewed> {
    return await this.prisma.recentlyViewed.create({
      data: recentlyViewedProductDto,
    });
  }

  async getRecentlyViewedProducts(
    id: string,
  ): Promise<RecentlyViewed[] | null> {
    return await this.prisma.recentlyViewed.findMany({
      where: {
        userId: id,
      },
      include: {
        product: true,
      },
    });
  }

  async getItemsUsersAlsoBought(id: string): Promise<object> {
    const result = await this.populateItemsUsersAlsoBought(id);
    const finalArray = [];

    if (result && result.length) {
      result.forEach((team: ITeamWithOtherInfo) => {
        team.orders.forEach((order) => {
          order.basket.forEach((item: { product: { id: string } }) => {
            finalArray.push(item.product);
          });
        });
      });
    }
    const unique = [...new Map(finalArray.map((m) => [m.id, m])).values()];
    return unique;
  }

  async populateItemsUsersAlsoBought(id: string): Promise<object[] | null> {
    return await this.prisma.buyingTeam.findMany({
      where: {
        producerId: id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 3,
      include: {
        orders: {
          include: {
            basket: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async getProductNormal(producerId: string): Promise<Product[] | null> {
    return await this.prisma.product.findMany({
      where: {
        producerId,
        approvalStatus: ProductApprovalStatus.APPROVED,
      },
    });
  }

  async getProductsAdmin(
    approvalStatus = ProductApprovalStatus.APPROVED,
    offset = 0,
  ): Promise<object> {
    const result = await this.prisma.$transaction([
      this.prisma.product.count({ where: { approvalStatus } }),
      this.prisma.product.findMany({
        skip: offset,
        take: 7,
        where: {
          approvalStatus,
        },
        select: {
          id: true,
          imageUrl: true,
          name: true,
          description: true,
          stock: true,
          producer: {
            select: {
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
          category: {
            select: {
              name: true,
            },
          },
          type: true,
          measuresPerSubUnit: true,
          quantityOfSubUnitPerOrder: true,
          wholesalePrice: true,
          price: true,
          vat: true,
          unitsOfMeasurePerSubUnit: true,
          subUnit: true,
          approvalStatus: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ]);
    return result;
  }

  async productSearch(
    keyword: string,
    approvalStatus = ProductApprovalStatus.APPROVED,
  ): Promise<object[] | null> {
    const result = await this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
            approvalStatus,
          },
          {
            category: {
              name: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            approvalStatus,
          },
          {
            producer: {
              categories: {
                some: {
                  category: {
                    name: {
                      contains: keyword,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
            approvalStatus,
          },
        ],
      },
      select: {
        id: true,
        imageUrl: true,
        name: true,
        description: true,
        stock: true,
        producer: {
          select: {
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
        category: {
          select: {
            name: true,
          },
        },
        type: true,
        measuresPerSubUnit: true,
        quantityOfSubUnitPerOrder: true,
        wholesalePrice: true,
        price: true,
        vat: true,
        unitsOfMeasurePerSubUnit: true,
        subUnit: true,
        approvalStatus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return result;
  }

  async updateProductApprovalStatus(
    updateProductStatusDto: UpdateProductStatusDto,
  ): Promise<string | null> {
    updateProductStatusDto.products.forEach(async (productId) => {
      await this.prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          approvalStatus: updateProductStatusDto.approvalStatus,
        },
      });
    });
    return 'Update Successful';
  }

  async getSupplementProducts(
    limit: number,
    userId: string = null,
  ): Promise<Partial<SupplementTeamProducts>[] | null> {
    let userPurchasedProducts = [];
    if (userId) {
      userPurchasedProducts = await this.prisma.basketC.findMany({
        where: {
          userId,
        },
        select: {
          productId: true,
        },
      });
    }

    const allProducts = await this.prisma.supplementTeamProducts.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        teamId: true,
        productId: true,
        status: true,
        orderTreashold: true,
        foundingMembersDiscount: true,
        earlyMembersDiscount: true,
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            price: true,
            wholesalePrice: true,
            vat: true,
            rabbleMarkUp: true,
            status: true,
            rrp: true,
            priceInfo: true,
            tags: true,
            producer: {
              select: {
                businessName: true,
                imageUrl: true,
              },
            },
            formulationSummary: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                members: {
                  where: {
                    status: 'APPROVED',
                  },
                },
              },
            },
          },
        },
      },
      ...(limit && { take: +limit }),
    });

    // Process each product to add discount information and teamLatestOrder
    const processedProducts = await Promise.all(
      allProducts.map(async (product) => {
        const teamMemberCount = product.team?._count?.members || 0;
        const priceInfo = product.product.priceInfo as unknown as IPricePlan[];
        const teamStatus = product.status ?? SupplementTeamStatus.ACTIVE;
        const activePercentageDiscount = this.getPriceDiscount(
          priceInfo,
          teamMemberCount,
          teamStatus,
        );

        const priceWithDiscount = !activePercentageDiscount
          ? product.product.rrp
          : Number(
              (
                +product.product.rrp -
                (+activePercentageDiscount / 100) * +product.product.rrp
              ).toFixed(2),
            );

        // Get teamLatestOrder information
        const teamLatestOrder = await this.paymentService.getTeamLatestOrder(
          product.teamId,
        );

        return {
          ...product,
          product: {
            ...product.product,
            price: new Decimal(priceWithDiscount),
            activePercentageDiscount,
          },
          firstDelivery: teamLatestOrder?.firstDelivery || false,
        };
      }),
    );

    // return unpurchased products
    const unpurchasedProducts = processedProducts.filter(
      (product) =>
        !userPurchasedProducts.some((p) => p.productId === product.productId),
    );

    return unpurchasedProducts;
  }

  async getSupplementProductsTags(): Promise<Partial<SupplementTags>[] | null> {
    return await this.prisma.supplementTags.findMany({
      select: {
        name: true,
        type: true,
      },
    });
  }

  getPriceDiscount(
    pricePlan: IPricePlan[],
    teamMemberCount: number,
    teamStatus: SupplementTeamStatus = SupplementTeamStatus.ACTIVE,
  ): number | null {
    if (!pricePlan || pricePlan.length === 0) {
      return null;
    }

    // If status is PREORDER, return the lowest discount available
    if (teamStatus === SupplementTeamStatus.PREORDER) {
      const sortedPlans = [...pricePlan].sort(
        (a, b) => a.percentageDiscount - b.percentageDiscount,
      );
      return sortedPlans[0].percentageDiscount;
    }

    // For ACTIVE status, use the original logic
    pricePlan?.sort((a, b) => (a.teamMemberCount > b.teamMemberCount ? 1 : -1));
    let discount = null;
    for (const plan of pricePlan) {
      if (teamMemberCount >= plan.teamMemberCount) {
        discount = plan.percentageDiscount;
      }
    }
    return discount;
  }
}
