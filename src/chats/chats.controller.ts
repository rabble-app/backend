import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IAPIResponse, IGetChat } from 'src/lib/types';
import { formatResponse } from 'src/lib/helpers';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  /**
   * create new chat.
   * @param {Body} createChatDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof NotificationsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post()
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Chat added successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async create(
    @Request() req,
    @Body() createChatDto: CreateChatDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const userId = req.user.id ? req.user.id : req.user.userId;
    const result = await this.chatsService.create(createChatDto, userId);
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Chat added successfully',
    );
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOkResponse({ description: 'Chats returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findAll(@Request() req, @Query() queryObj: IGetChat) {
    const userId = req.user.id ? req.user.id : req.user.userId;
    return await this.chatsService.findAll(queryObj, userId);
  }
}
