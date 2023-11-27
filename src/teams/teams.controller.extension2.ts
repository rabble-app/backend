import {
  Controller,
  HttpStatus,
  Res,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { TeamsServiceExtension2 } from './teams.service.extension2';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('teams')
@Controller('team')
export class TeamsControllerExtension2 {
  constructor(
    private readonly teamsServiceExtension2: TeamsServiceExtension2,
  ) {}

  /**
   * return buying teams subscriptions.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('subscriptions')
  @ApiOkResponse({
    description: 'Buying teams subscription returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getBuyingTeamSubscriptions(
    @Query('offset') offset: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result =
      await this.teamsServiceExtension2.getAllBuyingTeamSubscription(
        offset ? +offset : undefined,
      );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Buying teams subscription returned successfully',
    );
  }
}
