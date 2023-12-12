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
  ApiTags,
} from '@nestjs/swagger';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { TeamsServiceExtension2 } from './teams.service.extension2';
import { AuthGuard } from 'src/auth/auth.guard';
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
   * return  single order.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('orders/:id')
  @ApiOkResponse({
    description: 'Order returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the order',
  })
  async getSingleOrder(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension2.getSingleOrder(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Order returned successfully',
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
   * search feature.
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
  async search(
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
    const result = await this.teamsServiceExtension2.search(
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
}
