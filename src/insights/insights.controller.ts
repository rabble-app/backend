import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InsightsService } from './insights.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Response } from 'express';
import { formatResponse } from '../lib/helpers';
@ApiTags('insights')
@Controller('insights')
@ApiBearerAuth()
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @UseGuards(AuthGuard)
  @Get('nwro')
  @ApiOkResponse({
    description: 'NWRO chart info returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiQuery({
    name: 'year',
    description: 'The number of years report you want to view',
  })
  async nwroChatData(
    @Query('years') years: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.insightsService.getNwroData(years);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'NWRO chart info returned successfully',
    );
  }

  @UseGuards(AuthGuard)
  @Get('users')
  @ApiOkResponse({
    description: 'Unique users chart info returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiQuery({
    name: 'year',
    description: 'The number of years report you want to view',
  })
  async uniqueUsersChatData(
    @Query('years') years: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.insightsService.getUniqueUsersData(years);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Unique users chart info returned successfully',
    );
  }
}
