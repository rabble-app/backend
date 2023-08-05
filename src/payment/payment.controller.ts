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
import { MakeCardDefaultDto } from './dto/make-card-default.dto';
import { UsersService } from '../users/users.service';
import { AddSingleBasketDto } from './dto/add-single-basket.dto';

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
   * @param {Body} addSingleBasketDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentController
   * @returns {JSON} - A JSON success response.
   */
  @Post('basket')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Item added to basket successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addToBasket(
    @Body() addSingleBasketDto: AddSingleBasketDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.addToBasket(addSingleBasketDto);
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
}
