import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from '@prisma/client';
import { PrismaService } from '../prisma.service';

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
}
