import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, ProductCategory, RecentlyViewed } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { RecentlyViewedProductDto } from './dto/recently-viewed-product.dto';
import { ITeamWithOtherInfo } from '../../src/lib/types';
import { PaymentService } from '../../src/payment/payment.service';

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

  async getProduct(id: string, teamId = ''): Promise<Product | null> {
    let orderId = '';
    // get team latest order id
    if (teamId) {
      const result = await this.paymentService.getTeamLatestOrder(teamId);
      orderId = result.id;
    }
    return await this.prisma.product.findFirst({
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
                amount: true,
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
      },
    });
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
      },
    });
  }
}
