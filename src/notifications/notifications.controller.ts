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
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AuthGuard } from '../../src/auth/auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * create new notification.
   * @param {Body} createNotificationDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof NotificationsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Notification added successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.notificationsService.createNotification(
      createNotificationDto,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Notification added successfully',
    );
  }

  /**
   * update notification.
   * @param {Body} updateNotificationDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof NotificationsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch('')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Notification updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async updateNotification(
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.notificationsService.clearNotification(
      updateNotificationDto.userId,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Notification cleared successfully',
    );
  }

  /**
   * delete notification.
   * @param {Response} res - The payload.
   * @memberof NotificationsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Notification deleted successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The notification id',
  })
  async deleteNotification(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.notificationsService.deleteNotification({ id });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Notification deleted successfully',
    );
  }

  /**
   * return notifications.
   * @param {Response} res - The payload.
   * @memberof NotificationsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Notification returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The user id',
  })
  async returnNotification(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.notificationsService.returnNotifications(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Notification returned successfully',
    );
  }

  @Post('whatsapp')
  async testWhatsapp() {
    return await this.notificationsService.addParticipant(
      'CH06295a17b1e44170a2cac274fbeb6c37',
      '+2347037381011',
    );
  }
}
