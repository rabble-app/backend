import { Controller, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse, SearchCategory } from '../lib/types';
import { AddProducerCategoryDto } from './dto/add-producer-category.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RemoveProducerCategoryDto } from './dto/remove-producer-category.dto';
import { CreateDeliveryAreaDto } from './dto/create-delivery-area.dto';
import { UserBasketDto } from './dto/user-basket.dto';

@ApiTags('users')
@Controller('users')
export class UsersControllerExtension {
  constructor(private readonly usersService: UsersService) {}

  /**
   * return user requests
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('requests/:id')
  @ApiOkResponse({ description: 'Users requests returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the user',
  })
  async myRequests(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.getMyRequests(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Users requests returned successfully',
    );
  }

  /**
   * add category to producer
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch('producer/category/add')
  @ApiOkResponse({ description: 'Category added to producer successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addCategoryToProducer(
    @Body() addProducerCategoryDto: AddProducerCategoryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.addProducerCategory(
      addProducerCategoryDto,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Category added to producer successfully',
    );
  }

  /**
   * remove category to producer
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Delete('producer/category/remove')
  @ApiOkResponse({ description: 'Category removed from producer successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async removeCategoryFromProducer(
    @Body() removeProducerCategoryDto: RemoveProducerCategoryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.removeProducerCategory({
      id: removeProducerCategoryDto.producerCategoryId,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Category removed from producer successfully',
    );
  }

  /**
   * search feature.
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/search/:keyword/:category')
  @ApiOkResponse({ description: 'Search result returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiParam({
    name: 'keyword',
    required: true,
    description: 'The keyword of the search',
  })
  @ApiParam({
    name: 'category',
    required: true,
    description: 'The search category',
  })
  async search(
    @Request() req,
    @Param('keyword') keyword: string,
    @Param('category') category: SearchCategory,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const userId = req.user.id ? req.user.id : req.user.userId;
    const acceptedCategories = ['SUPPLIER', 'PRODUCT', 'TEAM'];
    if (!acceptedCategories.includes(category.toUpperCase())) {
      return formatResponse(
        'Invalid category supplied',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        `Category can be ${acceptedCategories.toString()}`,
      );
    }
    if (keyword.length < 3) {
      return formatResponse(
        'Invalid keyword length',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        `Keyword must be greater than 2 characters`,
      );
    }
    const result = await this.usersService.search(userId, keyword, category);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Search result returned successfully',
    );
  }

  /**
   * return user recent searches.
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/recent-searches')
  @ApiOkResponse({ description: 'Recent searches returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  async recentSearches(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const userId = req.user.id ? req.user.id : req.user.userId;
    const result = await this.usersService.recentSearches(userId);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Recent searches returned successfully',
    );
  }

  /**
   * return popular searches.
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/popular-searches')
  @ApiOkResponse({ description: 'Popular searches returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async popularSearches(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.popularSearches();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Popular searches returned successfully',
    );
  }

  /**
   * add producer delivery area.
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('/producer/delivery-area')
  @ApiOkResponse({ description: 'Delivery area added successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async deliveryAddress(
    @Request() req,
    @Body() createDeliveryAreaDto: CreateDeliveryAreaDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const producerId = req.user.producerId;
    const result = await this.usersService.addDeliveryArea(
      producerId,
      createDeliveryAreaDto,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Delivery address added successfully',
    );
  }

  /**
   * return users basket.
   * @param {Body} userBasketDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('basket')
  @ApiOkResponse({ description: 'User basket returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async myBasket(
    @Request() req,
    @Body() userBasketDto: UserBasketDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const userId = req.user.userId;
    const result = await this.usersService.getBasket(
      userId,
      userBasketDto.teamId,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'User basket returned successfully',
    );
  }

  /**
   * return producer categories.
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('producers/categories')
  @ApiOkResponse({ description: 'Producer categories returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getProducerCategories(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.getProducersCategories();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Producer categories returned successfully',
    );
  }

  /**
   * return user stripe profile.
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @Get('/stripe-profile')
  @ApiOkResponse({ description: 'Stripe profile returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async stripeProfile(
    @Query('accountId') accountId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.getStripeProfile(accountId);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Stripe profile returned successfully',
    );
  }
}
