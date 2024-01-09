import { AuthGuard } from '../../src/auth/auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse, ProductApprovalStatus } from '../lib/types';
import { ProductsService } from './products.service';
import { RecentlyViewedProductDto } from './dto/recently-viewed-product.dto';
import { Response } from 'express';
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOkResponse({ description: 'Product returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the product',
  })
  async getProduct(
    @Query('teamId') teamId: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.getProduct(id, teamId);
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
  @UseGuards(AuthGuard)
  @Get('/producer/:id')
  @ApiOkResponse({ description: 'Producer products returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the producer',
  })
  async getProducerProducts(
    @Query('teamId') teamId: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.getProducerProducts(id, teamId);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Producer products returned successfully',
    );
  }

  /**
   * record recently viewed product.
   * @param {Body} recentlyViewedProductDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof ProductsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('recently-viewed')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({
    description: 'Recently viewed product recorded successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async recentlyViewed(
    @Body() recentlyViewedProductDto: RecentlyViewedProductDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.recordRecentlyViewed(
      recentlyViewedProductDto,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Recently viewed product recorded successfully',
    );
  }

  /**
   * return users recently viewed products.
   * @param {Response} res - The payload.
   * @memberof ProductsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/recently-viewed/:id')
  @ApiOkResponse({
    description: 'Recently viewed products returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the user',
  })
  async getRecentlyViewedProducts(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.getRecentlyViewedProducts(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Recently viewed products returned successfully',
    );
  }

  /**
   * return producer's products users also bought.
   * @param {Response} res - The payload.
   * @memberof ProductsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('also-bought/:producerId')
  @ApiOkResponse({
    description: 'Items other users also bought returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'producerId',
    required: true,
    description: 'The producer id',
  })
  async usersAlsoBought(
    @Param('producerId') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.getItemsUsersAlsoBought(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Items other users also bought returned successfully',
    );
  }

  /**
   * return producer's products normally
   * @param {Response} res - The payload.
   * @memberof ProductsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('normal/:producerId')
  @ApiOkResponse({
    description: 'Producers products returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'producerId',
    required: true,
    description: 'The producer id',
  })
  async productNormal(
    @Param('producerId') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.getProductNormal(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Producers products returned successfully',
    );
  }

  /**
   * return products for admin panel
   * @param {Response} res - The payload.
   * @memberof ProductsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/admin/section')
  @ApiOkResponse({
    description: 'Products returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async productsAdmin(
    @Query('offset') offset: number,
    @Query('approvalStatus') approvalStatus: ProductApprovalStatus,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.productsService.getProductsAdmin(
      approvalStatus,
      offset ? +offset : undefined,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Products returned successfully',
    );
  }

  /**
   * search feature for products.
   * @param {Response} res - The payload.
   * @memberof ProductsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/admin/search/:keyword/')
  @ApiOkResponse({ description: 'Search result returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiParam({
    name: 'keyword',
    required: true,
    description: 'The keyword of the search',
  })
  async productSearch(
    @Param('keyword') keyword: string,
    @Query('approvalStatus') approvalStatus: ProductApprovalStatus,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    if (keyword.length < 3) {
      return formatResponse(
        'Invalid keyword length',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        `Keyword must be greater than 2 characters`,
      );
    }
    const result = await this.productsService.productSearch(
      keyword,
      approvalStatus,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Search result returned successfully',
    );
  }
}
