import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {
  BuyingTeam,
  Order,
  Product,
  ProductCategory,
  RecentlyViewed,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { RecentlyViewedProductDto } from './dto/recently-viewed-product.dto';
import { ITeamWithOtherInfo } from 'src/lib/types';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    return await this.prisma.product.create({
      data: createProductDto,
    });
  }

  async getProduct(id: string): Promise<Product | null> {
    return await this.prisma.product.findFirst({
      where: {
        id,
      },
      include: {
        producer: true,
      },
    });
  }

  async getProducerProducts(id: string): Promise<ProductCategory[] | null> {
    const finalResult: ProductCategory[] = [];

    const result = await this.prisma.productCategory.findMany({
      include: {
        products: {
          where: {
            producerId: id,
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

  async searchProducts(keyword: string): Promise<Product[] | null> {
    return await this.prisma.product.findMany({
      where: {
        name: {
          contains: keyword,
          mode: 'insensitive',
        },
      },
    });
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
          finalArray.push(...order.basket);
        });
      });
    }

    return finalArray;
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
