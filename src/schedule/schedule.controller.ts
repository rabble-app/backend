import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * charge users.
   * @memberof ScheduleController
   * @returns {JSON} - A JSON success response.
   */
  @Get('charge-users')
  @ApiOkResponse({
    description: 'Charge function performed successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async chargeUsers(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.scheduleService.chargeUsers();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Charge function performed successfully',
    );
  }

  /**
   * complete orders.
   * @memberof ScheduleController
   * @returns {JSON} - A JSON success response.
   */
  @Get('complete-orders')
  @ApiOkResponse({
    description: 'Complete order function performed successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async completeOrders(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.scheduleService.completeOrders();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Complete order function performed successfully',
    );
  }

  /**
   * cancel orders.
   * @memberof ScheduleController
   * @returns {JSON} - A JSON success response.
   */
  @Get('cancel-orders')
  @ApiOkResponse({
    description: 'Cancel order function performed successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async cancelOrders(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.scheduleService.cancelOrders();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Cancel order function performed successfully',
    );
  }

  /**
   * create orders.
   * @memberof ScheduleController
   * @returns {JSON} - A JSON success response.
   */
  @Get('create-orders')
  @ApiOkResponse({
    description: 'Create order function performed successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async createOrders(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.scheduleService.handleNewOrders();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Create order function performed successfully',
    );
  }

  /**
   * authorize payment.
   * @memberof ScheduleController
   * @returns {JSON} - A JSON success response.
   */
  @Get('authorize-payment')
  @ApiOkResponse({
    description: 'Authorize payment function performed successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async authorizePayment(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.scheduleService.authorizePayments();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Authorize payment function performed successfully',
    );
  }
}
