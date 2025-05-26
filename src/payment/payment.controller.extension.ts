import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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
  ApiQuery,
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
import { JoinSupplementTeamDto } from './dto/join-supplement-team.dto';

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
  @ApiQuery({
    name: 'isSupplementApp',
    required: true,
    description: 'Specifies that this is coming from supplement App',
  })
  async userPaymentOptions(
    @Param('id') id: string,
    @Query('isSupplementApp') isSupplementApp: boolean,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentServiceExtension.getUserPaymentOptions(
      id,
      isSupplementApp,
    );
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
  @ApiQuery({
    name: 'isSupplementApp',
    required: true,
    description: 'Specifies that this is coming from supplement App',
  })
  async createIntent(
    @Body() createIntentDto: CreateIntentDto,
    @Query('isSupplementApp') isSupplementApp: boolean,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.createIntent(
      createIntentDto,
      false,
      isSupplementApp,
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
    const result =
      await this.paymentServiceExtension.handleSupplementPaymentCapture(
        captureIntentDto,
      );
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
    const result = await this.paymentServiceExtension.handleTopUpPayment(
      topUpDto,
    );
    if (result == 1) {
      return formatResponse(
        'User do not have any active subscription',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'No Active Subscription',
      );
    }
    if (result == 2) {
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
    const result = await this.paymentServiceExtension.updateBasketItem({
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

  /**
   * Create Payment intent
   * @param {Response} res - The payload.
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('setup-intent')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Payment intent created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async createIntentForCardSetup(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.createIntentForCardSetup();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Payment intent created successfully',
    );
  }

  /**
   * Create Payment intent
   * @param {Response} res - The payload.
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('supplement/join-team')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'User joined team successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async joinSupplementTeam(
    @Res({ passthrough: true }) res: Response,
    @Body() joinSupplementTeamDto: JoinSupplementTeamDto,
  ): Promise<IAPIResponse> {
    const result = await this.paymentService.joinSupplementTeam(
      joinSupplementTeamDto,
    );
    if (result == 1) {
      return formatResponse(
        'User not found',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Joining team failed',
      );
    }
    if (result == 2 || result == 3) {
      return formatResponse(
        'User could not be charged',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Payment failed',
      );
    }

    if (result == 4) {
      return formatResponse(
        'Could not add user to team',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Joining team failed',
      );
    }

    if (result == 5) {
      return formatResponse(
        'Could not store user basket',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Joining team failed',
      );
    }

    if (result == 6) {
      return formatResponse(
        'User does not have an active subscription',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Joining team failed',
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'User joined team successfully',
    );
  }

  /**
   * Handle yearly subscription payment
   * @param {string} userId - The user ID
   * @param {Response} res - The response object
   * @memberof PaymentControllerExtension
   * @returns {JSON} - A JSON success response
   */
  @UseGuards(AuthGuard)
  @Post('subscription/yearly/:userId')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Yearly subscription processed successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'The ID of the user to process subscription for',
  })
  async handleYearlySubscription(
    @Param('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentServiceExtension.handleYearlySubscription(
      userId,
    );

    if (!result) {
      return formatResponse(
        'Failed to process yearly subscription',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Subscription processing failed',
      );
    }

    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Yearly subscription processed successfully',
    );
  }

  @UseGuards(AuthGuard)
  @Get('subscription/status/:userId')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Subscription status retrieved successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'The ID of the user to check subscription status for',
  })
  async getSubscriptionStatus(
    @Param('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.paymentServiceExtension.getSubscriptionRecord(
      userId,
    );

    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Subscription status retrieved successfully',
    );
  }
}
