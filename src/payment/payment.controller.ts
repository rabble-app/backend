import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
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

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  teamsService: any;
  constructor(private readonly paymentService: PaymentService) {}

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
   * @param {id} teamId
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
}