import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Res,
  UseFilters,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { AuthGuard } from '../auth/auth.guard';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse } from '../lib/types';
import { HttpExceptionFilter } from '../middlewares/http-exception.filters';
import { Response } from 'express';
import { ClaimCCDto } from './dto/referrals.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('referrals')
@ApiTags('referrals')
@ApiBearerAuth()
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  /**
   * Claim rewards.
   * @param {Response} res - The payload.
   * @memberof ReferralsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('claim-rewards')
  @UseFilters(HttpExceptionFilter)
  async claims(
    @Body() payload: ClaimCCDto,
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ): Promise<IAPIResponse> {
    const userId = req.user?.id ?? req.user?.userId;
    if (userId !== payload.userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const result = await this.referralsService.claimRewards({
      userId,
      rewardId: payload.rewardId,
    });
    if (!result) {
      throw new HttpException(
        'Failed to claim rewards',
        HttpStatus.BAD_REQUEST,
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Rewards claimed successfully',
    );
  }

  @Get('tracking')
  @UseGuards(AuthGuard)
  @UseFilters(HttpExceptionFilter)
  async tracking(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const userId = req.user?.id ?? req.user?.userId;
    const result = await this.referralsService.getReferralTracking(userId);
    if (!result) {
      throw new HttpException(
        'No record found for user',
        HttpStatus.BAD_REQUEST,
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Referral tracking',
    );
  }

  @Get('info')
  @UseGuards(AuthGuard)
  @UseFilters(HttpExceptionFilter)
  async info(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const userId = req.user?.id ?? req.user?.userId;
    const result = await this.referralsService.getReferralInfo(userId);
    if (!result) {
      throw new HttpException(
        'No record found for user',
        HttpStatus.BAD_REQUEST,
      );
    }
    return formatResponse(result, res, HttpStatus.OK, false, 'Referral info');
  }

  @Get('reward-categories')
  @UseGuards(AuthGuard)
  @UseFilters(HttpExceptionFilter)
  async rewardCategories(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.referralsService.getRewardCategories();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Reward categories',
    );
  }
}
