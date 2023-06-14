import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, RecentlyViewed } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { RecentlyViewedProductDto } from './dto/recently-viewed-product.dto';

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

  async getProducerProducts(id: string): Promise<Product[] | null> {
    return await this.prisma.product.findMany({
      where: {
        producerId: id,
      },
    });
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
    const result = await this.prisma.buyingTeam.findMany({
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
    const finalArray = [];

    result.forEach((team) => {
      team?.orders.forEach((order) => {
        finalArray.push(...order.basket);
      });
    });

    return finalArray;
  }
}
