import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  Get,
  Param,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * create new product.
   * @param {Body} createProductDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof ProductsController
   * @returns {JSON} - A JSON success response.
   */
  @Post('create')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Product created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.createProduct(createProductDto);
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Product created successfully',
    );
  }

  /**
   * return a single product.
   * @param {Response} res - The payload.
   * @memberof ProductsController
   * @returns {JSON} - A JSON success response.
   */
  @Get(':id')
  @ApiOkResponse({ description: 'Product returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the product',
  })
  async getProduct(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.getProduct(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Product returned successfully',
    );
  }

  /**
   * return a producer's product.
   * @param {Response} res - The payload.
   * @memberof ProductsController
   * @returns {JSON} - A JSON success response.
   */
  @Get('/producer/:id')
  @ApiOkResponse({ description: 'Producer products returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the producer',
  })
  async getProducerProducts(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.getProducerProducts(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Producer products returned successfully',
    );
  }

  /**
   * search for products.
   * @param {Response} res - The payload.
   * @memberof ProductsController
   * @returns {JSON} - A JSON success response.
   */
  @Get('/search/:keyword')
  @ApiOkResponse({ description: 'Products returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'keyword',
    required: true,
    description: 'The keyword of the product',
  })
  async searchProducts(
    @Param('keyword') keyword: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.searchProducts(keyword);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Products returned successfully',
    );
  }
}
