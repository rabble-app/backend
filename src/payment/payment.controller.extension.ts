import {
  Body,
  Controller,
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

@ApiTags('payments')
@Controller('payments')
export class PaymentControllerExtension {
  teamsService: any;
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentServiceExtension: PaymentServiceExtension,
  ) {}
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
    const result = await this.paymentServiceExtension.removePaymentOption(id);
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
}
