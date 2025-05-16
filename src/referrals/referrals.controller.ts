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
import {
  ApplyUserCodeDto,
  ApplyUserCodeResponseDto,
  ClaimCCDto,
  CreditInfoDto,
  CreditInfoResponseDto,
  GetApplicableBonusDto,
  ReferralInfoResponseDto,
  ReferralTrackingResponseDto,
} from './dto/referrals.dto';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

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
  @ApiResponse(ReferralTrackingResponseDto)
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
  @ApiResponse(ReferralInfoResponseDto)
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

  @Post('credit-info')
  @UseGuards(AuthGuard)
  @UseFilters(HttpExceptionFilter)
  @ApiResponse({
    status: 200,
    description: 'Available credits info',
    type: CreditInfoResponseDto,
  })
  async availableCreditInfo(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
    @Body() payload: CreditInfoDto,
  ): Promise<IAPIResponse> {
    const userId = req.user?.id ?? req.user?.userId;
    const result = await this.referralsService.getApplicableCredits(
      userId,
      payload.amount,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Available credits info',
    );
  }

  @Post('apply-user-code')
  @UseGuards(AuthGuard)
  @UseFilters(HttpExceptionFilter)
  @ApiResponse(ApplyUserCodeResponseDto)
  async applyUserCode(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
    @Body() payload: ApplyUserCodeDto,
  ): Promise<IAPIResponse> {
    const userId = req.user?.id ?? req.user?.userId;
    const result = await this.referralsService.applyUserCode(
      userId,
      payload.userCode,
      payload.purchaseAmount,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'User code applied',
    );
  }

  @Post('applicable-bonus')
  @UseGuards(AuthGuard)
  @UseFilters(HttpExceptionFilter)
  @ApiResponse(ApplyUserCodeResponseDto)
  async getApplicableBonus(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
    @Body() payload: GetApplicableBonusDto,
  ): Promise<IAPIResponse> {
    const userId = req.user?.id ?? req.user?.userId;
    const result = await this.referralsService.getApplicableBonus(
      userId,
      payload.purchaseAmount,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Applicable bonus',
    );
  }
}
