import { Controller, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Patch, Res } from '@nestjs/common/decorators';
import { Response } from 'express';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse } from '../lib/types';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * update user record.
   * @param {Body} UpdateUserDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @Patch('update')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'User record updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.updateUser({
      where: { phone: updateUserDto.phone },
      data: updateUserDto,
    });
    return formatResponse(result, res, HttpStatus.OK);
  }
}
