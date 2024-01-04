import { AuthService } from './auth.service';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse } from '../lib/types';
import { Response } from 'express';
import { Controller, Post, Res, HttpStatus, Get, Query } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth-ext')
export class AuthControllerExtension {
  constructor(private readonly authService: AuthService) {}

  /**
   * Stripe Onboarding
   * @param {Response} res - The payload.
   * @memberof AuthControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @Post('stripe-onboarding')
  @ApiOkResponse({ description: 'Stripe onboarding link sent successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async stripeOnboarding(
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.authService.stripeOnboard();
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Stripe onboarding link sent successfully',
    );
  }

  /**
   * Stripe Onboarding refresh
   * @param {Response} res - The payload.
   * @memberof AuthControllerExtension
   * @returns {JSON} - A JSON success response.
   */
  @Get('stripe-onboarding')
  @ApiOkResponse({
    description: 'Stripe onboarding link refreshed successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async stripeOnboardingRefresh(
    @Query('accountId') accountId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.authService.stripeOnboardRefresh(accountId);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Stripe onboarding link refreshed successfully',
    );
  }
}
