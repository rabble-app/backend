import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse } from '../lib/types';
import { AuthService } from './auth.service';
import { SendOTPDto } from './dto/send-otp.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Send phone verification code.
   * @param {Body} SendOTPDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @Post('send-otp')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'OTP sent successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async sendOTP(
    @Body() sendOTPDto: SendOTPDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const sid = await this.authService.sendOTP(sendOTPDto);
    return formatResponse(
      { sid },
      res,
      HttpStatus.OK,
      false,
      'OTP sent successfully',
    );
  }

  /**
   * verify otp verification code.
   * @param {Body} VerifyOTPDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @Post('verify-otp')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'OTP verified successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiUnauthorizedResponse({ description: 'Invalid code supplied' })
  async verifyOTP(
    @Body() verifyOTPDto: VerifyOTPDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const isVerified = await this.authService.verifyOTP(verifyOTPDto);
    if (!isVerified) {
      return formatResponse(
        'Code is invalid',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Invalid code supplied',
      );
    }
    return formatResponse(
      isVerified,
      res,
      HttpStatus.OK,
      false,
      'OTP verified successfully',
    );
  }

  /**
   * quit rabble.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @Delete('quit/:id')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Removed from rabble app successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The user id',
  })
  async quitRabble(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.authService.quitApp(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Removed from rabble app successfully',
    );
  }
}
