import { Controller, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Get, Param, Res } from '@nestjs/common/decorators';
import { Response } from 'express';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse } from '../lib/types';

@ApiTags('users')
@Controller('users')
export class UsersControllerExtension {
  constructor(private readonly usersService: UsersService) {}

  /**
   * return user requests
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Get('requests/:id')
  @ApiOkResponse({ description: 'Users requests returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the user',
  })
  async myRequests(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.getMyRequests(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Users requests returned successfully',
    );
  }
}
