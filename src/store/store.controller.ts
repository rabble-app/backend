import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Request,
  HttpStatus,
  Patch,
  Param,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { CreateOpenHoursDto } from './dto/create-open-hours.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@ApiTags('store')
@ApiBearerAuth()
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  /**
   * create new store.
   * @param {Body} createStoreDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('create')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiConflictResponse({ description: 'Store name already exist' })
  @ApiCreatedResponse({ description: 'Store created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ): Promise<IAPIResponse> {
    const userId = req.user.id ? req.user.id : req.user.userId;
    const isExisting = await this.storeService.findStore({
      name: createStoreDto.name,
    });
    if (isExisting) {
      return formatResponse(
        'Duplicate name',
        res,
        HttpStatus.CONFLICT,
        true,
        'Store name already exist',
      );
    }
    const result = await this.storeService.createStore(userId, createStoreDto);
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Store created successfully',
    );
  }

  /**
   * Add store open hours.
   * @param {Body} createOpenHoursDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch('open-hours')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiConflictResponse({ description: 'Store open hours already exist' })
  @ApiCreatedResponse({ description: 'Store open hours added successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addOpenHours(
    @Body() createOpenHoursDto: CreateOpenHoursDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const isExisting = await this.storeService.getStoreOpenHours({
      partnerId: createOpenHoursDto.storeId,
    });
    if (isExisting) {
      return formatResponse(
        'Already exist',
        res,
        HttpStatus.CONFLICT,
        true,
        'Store open hours already exist',
      );
    }
    const result = await this.storeService.createStoreOpenHours(
      createOpenHoursDto,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Store open hours added successfully',
    );
  }

  /**
   * update store record.
   * @param {Body} updateStoreDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch(':storeId')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Store record updated successfully' })
  @ApiConflictResponse({
    description: 'Store name/stripe connect id already exist',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async updateStore(
    @Param('storeId') storeId: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    // check if name already exist
    if (updateStoreDto.name) {
      const isExisting = await this.storeService.findStore({
        name: updateStoreDto.name,
      });
      if (isExisting) {
        return formatResponse(
          'Duplicate name',
          res,
          HttpStatus.CONFLICT,
          true,
          'Store name already exist',
        );
      }
    }

    const result = await this.storeService.updateStore({
      where: { id: storeId },
      data: updateStoreDto,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Store record updated successfully',
    );
  }
}
