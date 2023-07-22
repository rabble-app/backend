import { Controller, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common/decorators';
import { Response } from 'express';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse } from '../lib/types';
import { AddProducerCategoryDto } from './dto/add-producer-category.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RemoveProducerCategoryDto } from './dto/remove-producer-category.dto';

@ApiTags('users')
@Controller('users')
export class UsersControllerExtension {
  constructor(private readonly usersService: UsersService) {}

  /**
   * return user requests
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
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

  /**
   * add category to producer
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch('producer/category/add')
  @ApiOkResponse({ description: 'Category added to producer successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addCategoryToProducer(
    @Body() addProducerCategoryDto: AddProducerCategoryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.addProducerCategory(
      addProducerCategoryDto,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Category added to producer successfully',
    );
  }

  /**
   * remove category to producer
   * @param {Response} res - The payload.
   * @memberof UsersControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Delete('producer/category/remove')
  @ApiOkResponse({ description: 'Category removed from producer successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async removeCategoryFromProducer(
    @Body() removeProducerCategoryDto: RemoveProducerCategoryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.usersService.removeProducerCategory({
      id: removeProducerCategoryDto.producerCategoryId,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Category removed from producer successfully',
    );
  }
}
