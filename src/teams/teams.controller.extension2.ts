import {
  Controller,
  HttpStatus,
  Res,
  Get,
  UseGuards,
  Query,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { TeamsServiceExtension2 } from './teams.service.extension2';
import { AuthGuard } from '../../src/auth/auth.guard';
import { OrderStatus } from '@prisma/client';

@ApiTags('teams')
@Controller('team')
export class TeamsControllerExtension2 {
  constructor(
    private readonly teamsServiceExtension2: TeamsServiceExtension2,
  ) {}

  /**
   * return buying teams subscriptions.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('subscriptions')
  @ApiOkResponse({
    description: 'Buying teams subscription returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getBuyingTeamSubscriptions(
    @Query('offset') offset: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result =
      await this.teamsServiceExtension2.getAllBuyingTeamSubscription(
        offset ? +offset : undefined,
      );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Buying teams subscription returned successfully',
    );
  }

  /**
   * return  orders.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('orders')
  @ApiOkResponse({
    description: 'Orders returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getOrders(
    @Query('offset') offset: number,
    @Query('status') status: OrderStatus,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension2.getOrders(
      status,
      offset ? +offset : undefined,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Orders returned successfully',
    );
  }

  /**
   * return  single order invoice information.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('orders/:orderId/:producerId')
  @ApiOkResponse({
    description: 'Order invoice infor returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'orderId',
    required: true,
    description: 'The id of the order',
  })
  @ApiParam({
    name: 'producerId',
    required: true,
    description: 'The id of the producer',
  })
  async getOrderInvoice(
    @Param('orderId') orderId: string,
    @Param('producerId') producerId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension2.getOrderInvoiceDetails(
      orderId,
      producerId,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Order invoice infor returned successfully',
    );
  }

  /**
   * Mark order as completed.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('orders/:id')
  @ApiOkResponse({
    description: 'Order status updated successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the order',
  })
  async markOrderAsCompleted(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension2.updateOrder({
      where: { id },
      data: {
        status: 'SUCCESSFUL',
      },
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Order status updated successfully',
    );
  }

  /**
   * search feature for orders.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/orders/search/:keyword/')
  @ApiOkResponse({ description: 'Search result returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiParam({
    name: 'keyword',
    required: true,
    description: 'The keyword of the search',
  })
  @ApiQuery({
    name: 'status',
    required: true,
    description: 'The order status',
  })
  async orderSearch(
    @Param('keyword') keyword: string,
    @Query('status') status: OrderStatus,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    if (keyword.length < 3) {
      return formatResponse(
        'Invalid keyword length',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        `Keyword must be greater than 2 characters`,
      );
    }
    const queryOrderStatus = status ? status : OrderStatus.PENDING;
    const result = await this.teamsServiceExtension2.ordersSearch(
      keyword,
      queryOrderStatus,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Search result returned successfully',
    );
  }

  /**
   * search feature for subscription.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/subscriptions/search/:keyword/')
  @ApiOkResponse({ description: 'Search result returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiParam({
    name: 'keyword',
    required: true,
    description: 'The keyword of the search',
  })
  async subscriptionSearch(
    @Param('keyword') keyword: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    if (keyword.length < 3) {
      return formatResponse(
        'Invalid keyword length',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        `Keyword must be greater than 2 characters`,
      );
    }
    const result = await this.teamsServiceExtension2.subscriptionSearch(
      keyword,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Search result returned successfully',
    );
  }

  /**
   * count for different order status.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/orders/status/count')
  @ApiOkResponse({ description: 'Order status counts returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async orderStatusCount(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension2.orderStatusCount();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Order status counts returned successfully',
    );
  }
}
