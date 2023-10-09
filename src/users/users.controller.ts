import { Controller, HttpStatus, ValidationPipe } from '@nestjs/common';
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
  UseGuards,
  UsePipes,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse } from '../lib/types';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeliveryAddressDto } from './dto/delivery-address.dto';
import { UpdateDeliveryAddressDto } from './dto/update-delivery-address.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { AuthGuard } from '../auth/auth.guard';

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
  @UsePipes(new ValidationPipe({ transform: true }))
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
   * update producer record.
   * @param {Body} updateProducerDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch('producer/:id')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'User record updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the producer',
  })
  async updateProducer(
    @Param('id') id: string,
    @Body() updateProducerDto: UpdateProducerDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    if (updateProducerDto.businessName) {
      const businessNameExist = await this.usersService.findProducer({
        businessName: updateProducerDto.businessName,
      });

      if (businessNameExist) {
        return formatResponse(
          'Business name already exist',
          res,
          HttpStatus.BAD_REQUEST,
          true,
          'Invalid Entry',
        );
      }
    }

    const result = await this.usersService.updateProducer({
      where: { id },
      data: updateProducerDto,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Producer record updated successfully',
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

  /**
   * return user delivery address.
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Get('delivery-address/:id')
  @ApiOkResponse({ description: 'Delivery address returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the user',
  })
  async getDeliveryAddress(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.getDeliveryAddress({ userId: id });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Delivery address returned successfully',
    );
  }

  /**
   * update user delivery address.
   * @param {Body} updateDeliveryAddressDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Patch('delivery-address/:id')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Delivery address updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the user',
  })
  async updateDeliveryAddress(
    @Param('id') id: string,
    @Body() updateDeliveryAddressDto: UpdateDeliveryAddressDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.updateDeliveryAddress({
      where: { userId: id },
      data: updateDeliveryAddressDto,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Delivery address updated successfully',
    );
  }

  /**
   * return teams a user is host on.
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Get('my-teams/:id')
  @ApiOkResponse({ description: 'Users teams returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the user',
  })
  async myTeams(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.getMyTeams(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Users teams returned successfully',
    );
  }
}
