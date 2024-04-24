import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
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
import { CreateDeliveryAreaDto } from './dto/create-delivery-areas.dto';

@ApiTags('postal-code')
@Controller('postal-code')
@ApiBearerAuth()
export class PostalCodeController {
  constructor(private readonly postalCodeService: PostalCodeService) {}

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
  ) {
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

  @UseGuards(AuthGuard)
  @Post('/producer/delivery-area')
  @ApiOkResponse({
    description: 'Delivery area added successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addDeliveryAreas(
    @Request() req,
    @Body() createDeliveryAreaDto: CreateDeliveryAreaDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const producerId = req.user.producerId;
    const result = await this.postalCodeService.createDeliveryAreas(
      producerId,
      createDeliveryAreaDto,
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

  @UseGuards(AuthGuard)
  @Get('/producer/delivery-days')
  @ApiOkResponse({
    description: 'Delivery days returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getProducerDeliveryDays(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
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
}
