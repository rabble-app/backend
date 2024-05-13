import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PostalCodeService } from './postal-code.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { CreateDeliveryDayDto } from './dto/create-delivery-days.dto';
import { IAPIResponse } from 'lib/types';
import { CreateDeliveryAreaDto } from './dto/add-delivery-areas.dto';
import { UpdateDeliveryDayInfoDto } from './dto/update-delivery-days-info.dto';

@ApiTags('postal-code')
@Controller('postal-code')
@ApiBearerAuth()
export class PostalCodeController {
  constructor(private readonly postalCodeService: PostalCodeService) {}

  /**
   * Search for delivery region and areas.
   * @param {Param} keyword - Request body object.
   * @param {Response} res - The payload.
   * @memberof PostalCodeController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/search/:keyword/')
  @ApiOkResponse({
    description: 'Postal code regions/areas returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'keyword',
    required: true,
    description: 'The keyword of the search',
  })
  async getPostalCodeAreas(
    @Param('keyword') keyword: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    if (keyword.length < 2) {
      return formatResponse(
        'Invalid keyword length',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        `Keyword must be greater than 1 characters`,
      );
    }
    const result = await this.postalCodeService.searchPostalCodeData(keyword);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Postal code regions/areas returned successfully',
    );
  }

  /**
   * Add producer delivery days/areas.
   * @param {Body} createDeliveryDayDto - Request body object.
   * @param {Response} res - The payload.
   * @param {Request} req - The request.
   * @memberof PostalCodeController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('/producer/delivery-days')
  @ApiOkResponse({
    description: 'Delivery area added successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addDeliveryDays(
    @Request() req,
    @Body() createDeliveryDayDto: CreateDeliveryDayDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const producerId = req.user.producerId;
    const result = await this.postalCodeService.createDeliveryDays(
      producerId,
      createDeliveryDayDto,
    );
    if (!result) {
      return formatResponse(
        'Error Occured',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        `Error occured while adding delivery days`,
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Delivery area added successfully',
    );
  }

  /**
   * Return producer delivery days/aresa.
   * @param {Response} res - The payload.
   * @param {Request} req - The request.
   * @memberof PostalCodeController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/producer/delivery-days')
  @ApiOkResponse({
    description: 'Delivery days returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getProducerDeliveryDays(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const producerId = req.user.producerId;
    const result = await this.postalCodeService.getProducerDeliveryDays(
      producerId,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Delivery days returned successfully',
    );
  }

  /**
   * Delete producer delivery region.
   * @param {Response} res - The payload.
   * @memberof PostalCodeController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Delete('/producer/delivery-region/:regionId')
  @ApiOkResponse({
    description: 'Delivery regions deleted successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'regionId',
    required: true,
    description: 'The id of the record of the region you want to delete',
  })
  async deleteProducerDeliveryRegion(
    @Param('regionId') regionId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.postalCodeService.deleteProducerDeliveryRegion(
      regionId,
    );
    if (!result) {
      return formatResponse(
        'Error Occured',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        `Error occured while removing delivery region/areas`,
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Delivery regions deleted successfully',
    );
  }

  /**
   * Delete producer delivery area.
   * @param {Response} res - The payload.
   * @memberof PostalCodeController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Delete('/producer/delivery-area/:areaId')
  @ApiOkResponse({
    description: 'Delivery area deleted successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'areaId',
    required: true,
    description: 'The id of the record of the region you want to delete',
  })
  async deleteProducerDeliveryArea(
    @Param('areaId') areaId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.postalCodeService.deleteProducerDeliveryArea(
      areaId,
    );
    if (!result) {
      return formatResponse(
        'Error Occured',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        `Error occured while removing delivery area`,
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Delivery regions deleted successfully',
    );
  }

  /**
   * Add delivery region to existing delivery day.
   * @param {Body} createDeliveryAreaDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PostalCodeController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Put('/producer/delivery-area')
  @ApiOkResponse({
    description: 'Delivery area added successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addDeliveryRegionToDeliveryDay(
    @Body() createDeliveryAreaDto: CreateDeliveryAreaDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.postalCodeService.addDeliveryAreas(
      createDeliveryAreaDto.deliveryDayId,
      createDeliveryAreaDto.regions,
    );
    if (!result) {
      return formatResponse(
        'Error Occured',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        `Error occured while adding delivery areas`,
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Delivery area added successfully',
    );
  }

  /**
   * Update delivery day info.
   * @param {Body} updateDeliveryDayInfoDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof PostalCodeController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch('/producer/delivery-day-info/:deliveryDayId')
  @ApiOkResponse({
    description: 'Delivery day info updated successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'deliveryDayId',
    required: true,
    description: 'The id of the record of the delivery day to update',
  })
  async updateDeliveryDaysInfo(
    @Param('deliveryDayId') deliveryDayId: string,
    @Body() updateDeliveryDayInfoDto: UpdateDeliveryDayInfoDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.postalCodeService.updateDeliveryDayInfo({
      where: { id: deliveryDayId },
      data: updateDeliveryDayInfoDto,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Delivery day info updated successfully',
    );
  }

  /**
   * Return producer delivery days.
   * @param {Response} res - The payload.
   * @memberof PostalCodeController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/producer/days-of-delivery/:producerId')
  @ApiOkResponse({
    description: 'Delivery days returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'producerId',
    required: true,
    description: 'The producer id',
  })
  async returnDeliveryDays(
    @Param('producerId') producerId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.postalCodeService.getProducerDaysOfDelivery(
      producerId,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Delivery days returned successfully',
    );
  }
}
