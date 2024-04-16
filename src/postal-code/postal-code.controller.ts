import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { PostalCodeService } from './postal-code.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';

@ApiTags('insights')
@Controller('postal-code')
@ApiBearerAuth()
export class PostalCodeController {
  constructor(private readonly postalCodeService: PostalCodeService) {}

  @UseGuards(AuthGuard)
  @Get('regions')
  @ApiOkResponse({
    description: 'Postal code regions returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getPostalCodeAreas(@Res({ passthrough: true }) res: Response) {
    const result = await this.postalCodeService.getAreaData();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Postal code regions returned successfully',
    );
  }
}
