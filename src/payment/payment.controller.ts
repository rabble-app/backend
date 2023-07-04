import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AddPaymentCardDto } from './dto/add-payment-card.dto';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { ChargeUserDto } from './dto/charge-user.dto ';
import { AddBulkBasketDto, AddToBasket } from './dto/add-bulk-basket.dto';
import { MakeCardDefaultDto } from './dto/make-card-default.dto';
import { UsersService } from '../users/users.service';
import { UpdateBasketItemDto } from './dto/update-basket-item.dto';
import { CreateIntentDto } from './dto/create-intent.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  teamsService: any;
  constructor(
    private readonly paymentService: PaymentService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Add new payment card for user.
   * @param {Body} addPaymentCardDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Post('add-card')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Card added successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addPaymentCard(
    @Body() addPaymentCardDto: AddPaymentCardDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.addCustomerCard(addPaymentCardDto);
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Card added successfully',
    );
  }

  /**
   * Make payment card default.
   * @param {Body} makeCardDefaultDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Post('default-card')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({
    description: 'Card made default payment option successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async makeCardDefault(
    @Body() makeCardDefaultDto: MakeCardDefaultDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.updateUser({
      where: {
        id: makeCardDefaultDto.userId,
      },
      data: {
        cardLastFourDigits: makeCardDefaultDto.lastFourDigits,
        stripeDefaultPaymentMethodId: makeCardDefaultDto.paymentMethodId,
      },
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Card made default payment option successfully',
    );
  }

  /**
   * Charge a user.
   * @param {Body} chargeUserDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Post('charge')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'User charged successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async chargeUser(
    @Body() chargeUserDto: ChargeUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.chargeUser(chargeUserDto);
    if (!result) {
      return formatResponse(
        'Error occurred',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Payment not successful',
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'User charged successfully',
    );
  }

  /**
   * Add bulk item to basket
   * @param {Body} addBulkBasketDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Post('basket-bulk')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Items added to basket successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addToBasketBulk(
    @Body() addBulkBasketDto: AddBulkBasketDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.saveBulkBasket(addBulkBasketDto);
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Items added to basket successfully',
    );
  }

  /**
   * Add single item to basket
   * @param {Body} addToBasket - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Post('basket')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Item added to basket successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addToBasket(
    @Body() addToBasket: AddToBasket,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.addToBasket(addToBasket);
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Item added to basket successfully',
    );
  }

  /**
   * delete item from basket.
   * @param {id} itemId
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Delete('basket/:id')
  @ApiOkResponse({ description: 'Item deleted successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The item id',
  })
  async deleteItemFromBasket(
    @Param('id') itemId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.deleteFromBasket({ id: itemId });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Item deleted successfully',
    );
  }

  /**
   * return a user payment options.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Get('options/:id')
  @ApiOkResponse({
    description: 'User payment option returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The stripe customer id',
  })
  async userPaymentOptions(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.getUserPaymentOptions(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'User payment option returned successfully',
    );
  }

  /**
   * remove payment option from user.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Patch('options/:id')
  @ApiOkResponse({
    description: 'Payment option removed successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The user payment method id',
  })
  async removePaymentOption(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.removePaymentOption(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Payment option removed successfully',
    );
  }

  /**
   * Update item in basket
   * @param {Body} updateBasketItemDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Patch('basket/:itemId')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Item updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'itemId',
    required: true,
    description: 'The id of the item you want to update',
  })
  async updateItemInBasket(
    @Param('itemId') id: string,
    @Body() updateBasketItemDto: UpdateBasketItemDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.updateBasketItem({
      where: { id },
      data: updateBasketItemDto,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Item updated successfully',
    );
  }
  /**
   * Create Payment intent
   * @param {Body} createIntentDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Post('intent')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Payment intent created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async createIntent(
    @Body() createIntentDto: CreateIntentDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.createIntent(createIntentDto);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Payment intent created successfully',
    );
  }
}
