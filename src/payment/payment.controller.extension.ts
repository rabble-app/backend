import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { UpdateBasketItemDto } from './dto/update-basket-item.dto';
import { CreateIntentDto } from './dto/create-intent.dto';
import { PaymentServiceExtension } from './payment.service.extension';
import { UpdateBasketBulkDto } from './dto/update-basket-bulk.dto';
import { ReturnIntentDto } from './dto/return-intent.dto';
import { AuthGuard } from '../../src/auth/auth.guard';

@ApiTags('payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentControllerExtension {
  teamsService: any;
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentServiceExtension: PaymentServiceExtension,
  ) {}
  /**
   * return a user payment options.
   * @param {Response} res - The payload.
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
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
    const result = await this.paymentServiceExtension.getUserPaymentOptions(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'User payment option returned successfully',
    );
  }

  /**
   * Update item in basket
   * @param {Body} updateBasketItemDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
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
    const result = await this.paymentServiceExtension.updateBasketItem({
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
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('intent')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Payment intent created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async createIntent(
    @Body() createIntentDto: CreateIntentDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.createIntentForApplePay(
      createIntentDto,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Payment intent created successfully',
    );
  }

  /**
   * Update bulk items in basket
   * @param {Body} updateBasketBulkDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch('basket-bulk')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Items updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async updateBasketBulk(
    @Body() updateBasketBulkDto: UpdateBasketBulkDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentServiceExtension.updateBasketBulk(
      updateBasketBulkDto,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Items updated successfully',
    );
  }

  /**
   * Retrieve Payment intent
   * @param {Body} returnIntentDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('retrieve-intent')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Payment intent created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async retrieveIntent(
    @Body() returnIntentDto: ReturnIntentDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.returnPaymentIntent(
      returnIntentDto.paymentIntentId,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Payment intent retrieved successfully',
    );
  }

  /**
   * This is for test
   * @param {Body} returnIntentDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @Get('test')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Payment intent created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async testTax(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentServiceExtension.recordTax();
    return formatResponse(result, res, HttpStatus.OK, false, 'Test completed');
  }
}
