import { Controller, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse } from '../lib/types';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProducerDto } from './dto/create-producer.dto';
import { DeliveryAddressDto } from './dto/delivery-address.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * update user record.
   * @param {Body} updateUserDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Patch('update')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'User record updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.updateUser({
      where: { phone: updateUserDto.phone },
      data: updateUserDto,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'User record updated successfully',
    );
  }

  /**
   * create new producer.
   * @param {Body} createProducerDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Post('create-producer')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Producer created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async createProducer(
    @Body() createProducerDto: CreateProducerDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.createProducer(createProducerDto);
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Producer created successfully',
    );
  }

  /**
   * return producers.
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Get('producers')
  @ApiOkResponse({ description: 'Producers returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getProducers(
    @Query('offset') offset: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.getProducers(
      offset ? +offset : undefined,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Producers returned successfully',
    );
  }

  /**
   * return single producer.
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Get('producer/:id')
  @ApiOkResponse({ description: 'Producer returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the producer',
  })
  async getProducer(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.findProducer({ id });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Producer returned successfully',
    );
  }

  /**
   * add user delivery address.
   * @param {Body} deliveryAddressDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Post('delivery-address')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Delivery address created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addDeliveryAddress(
    @Body() deliveryAddressDto: DeliveryAddressDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.createDeliveryAddress(
      deliveryAddressDto,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Delivery address created successfully',
    );
  }

  /**
   * return order history
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Get('order-history/:id')
  @ApiOkResponse({ description: 'Order history returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The user id',
  })
  async getOrderHistories(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.getOrderHistories(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Order history returned successfully',
    );
  }

  /**
   * return subscriptions
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Get('subscription/:id')
  @ApiOkResponse({ description: 'Subscriptions returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The user id',
  })
  async getSubscriptions(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.getSubscriptions(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Subscriptions returned successfully',
    );
  }
}
