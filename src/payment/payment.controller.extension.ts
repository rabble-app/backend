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
import { CaptureIntentDto } from './dto/capture-intent.dto';
import { TopUpDto } from './dto/topup.dto';

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
    const result = await this.paymentService.createIntent(
      createIntentDto,
    );
    return formatResponse(
      {
        paymentIntentId: result?.id,
        clientSecret: result?.client_secret,
        status: result?.status,
      },
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
   * Capture Payment intent
   * @param {Body} captureIntentDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('intent/capture')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Payment intent captured successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async captureIntent(
    @Body() captureIntentDto: CaptureIntentDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentServiceExtension.handleSupplementPaymentCapture(captureIntentDto)
    if (!result) {
      return formatResponse(
        'Payment capture failed',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Payment intent capture failed',
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Payment intent captured successfully',
    );
  }

  /**
   * Top up subscription
   * @param {Body} topUpDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('/supplement/topup')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Subscription top up processed successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async topUpSubscription(
    @Body() topUpDto: TopUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentServiceExtension.handleTopUpPayment(topUpDto)
    if (!result) {
      return formatResponse(
        'Subscription top up failed',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Payment intent capture failed',
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Subscription top up processed successfully',
    );
  }

  /**
   * Update item in basketC
   * @param {Body} updateBasketItemDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch('basketC/:itemId')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Subscription updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'itemId',
    required: true,
    description: 'The id of the item you want to update',
  })
  async updateItemInBasketC(
    @Param('itemId') id: string,
    @Body() updateBasketItemDto: UpdateBasketItemDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentServiceExtension.updateSubscriptionPlan({
      where: { id },
      data: updateBasketItemDto,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Subscription updated successfully',
    );
  }
}
