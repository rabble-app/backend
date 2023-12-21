import ChangePasswordDto from './dto/change-password.dto';
import EmailVerificationDto from './dto/email-verification.dto';
import ResendEmailVerificationDto from './dto/resend-email-verification.dto';
import ResetPasswordDto from './dto/reset-password.dto';
import { AuthService } from './auth.service';
import { courier } from '../../src/utils/mail';
import { CreateProducerDto } from './dto/create-producer.dto';
import { formatResponse } from '../lib/helpers';
import { IAPIResponse } from '../lib/types';
import { LoginProducerDto } from './dto/login-producer.dto';
import { Response } from 'express';
import { SendOTPDto } from './dto/send-otp.dto';
import { UsersService } from '../users/users.service';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Delete,
  Param,
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PusherUserAuthDto } from './dto/pusher-user-auth.dto';
import { AuthGuard } from './auth.guard';
import * as Pusher from 'pusher';
import { PusherChannelAuthDto } from './dto/pusher-channel-auth.dto';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
});
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Send phone verification code.
   * @param {Body} sendOTPDto - Request body object.
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
   * @param {Body} verifyOTPDto - Request body object.
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
  @UseGuards(AuthGuard)
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

  /**
   * Register Producer.
   * @param {Body} createProducerDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @Post('register')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Producer account created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async register(
    @Body() createProducerDto: CreateProducerDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    // check whether email, phone or business name already exist
    const emailExist = await this.usersService.findUser({
      email: createProducerDto.email,
    });

    const phoneExist = await this.usersService.findUser({
      phone: createProducerDto.phone,
    });

    const businessNameExist = await this.usersService.findProducer({
      businessName: createProducerDto.businessName,
    });

    if (emailExist || phoneExist || businessNameExist) {
      return formatResponse(
        'User already exist',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Email | phone number | business name already exist',
      );
    }

    // save data
    const result = await this.authService.registerProducer(createProducerDto);
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'User account created successfully',
    );
  }

  /**
   * Login Producer.
   * @param {Body} loginProducerDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @Post('login')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Producer login successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async login(
    @Body() loginProducerDto: LoginProducerDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.authService.loginProducer(loginProducerDto);
    if (!result) {
      return formatResponse(
        'Invalid credentials supplied',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Incorrect email/password',
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Producer login successfully',
    );
  }

  /**
   * Email verification.
   * @param {Body} emailVerificationDto - Request body object.
   * @param {Response} res - Response object.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @Post('email-verification')
  @ApiOkResponse({ description: 'Email verification successful' })
  @ApiUnauthorizedResponse({ description: 'Invalid/expired link' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async emailVerification(
    @Body() emailVerificationDto: EmailVerificationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.authService.emailVerification(
      emailVerificationDto.token,
    );
    if (!result) {
      return formatResponse(
        'Invalid/expired link',
        res,
        HttpStatus.UNAUTHORIZED,
        true,
        'Verification failed',
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Email verified successfully',
    );
  }

  /**
   * Resend Email verification.
   * @param {Body} resendEmailVerificationDto - Request body object.
   * @param {Response} res - Response object.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @Post('resend-email-verification')
  @ApiOkResponse({ description: 'Email verification link sent successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async resendEmailVerification(
    @Body() resendEmailVerificationDto: ResendEmailVerificationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const user = await this.usersService.findUser({
      email: resendEmailVerificationDto.email,
    });
    if (!user) {
      return formatResponse(
        'User not found',
        res,
        HttpStatus.NOT_FOUND,
        true,
        'User does not exist',
      );
    }

    const token = this.authService.generateToken({
      userId: user.id,
      producerId: user.producer.id,
    });

    // send mail
    await courier.send({
      message: {
        to: {
          email: user.email,
        },
        template: `${process.env.EMAIL_VERIFICATION_TEMPLATE}`,
        data: {
          url: `${process.env.EMAIL_URL}${process.env.CONFIRM_ACCOUNT_URL}?token=${token}`,
        },
      },
    });
    return formatResponse(
      user,
      res,
      HttpStatus.OK,
      false,
      'Email verification link sent successfully',
    );
  }

  /**
   * Reset password.
   * @param {Body} resetPasswordDto - Request body object.
   * @param {Response} res - Response object.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @Post('send-reset-password-link')
  @ApiOkResponse({ description: 'Reset password link sent successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const user = await this.usersService.findUser({
      email: resetPasswordDto.email,
    });
    if (!user) {
      return formatResponse(
        'User not found',
        res,
        HttpStatus.NOT_FOUND,
        true,
        'User does not exist',
      );
    }

    const token = this.authService.generateToken({
      userId: user.id,
      producerId: user.producer.id,
    });
    // send mail
    await courier.send({
      message: {
        to: {
          email: user.email,
        },
        template: `${process.env.RESET_PASSWORD_TEMPLATE}`,
        data: {
          url: `${process.env.EMAIL_URL}${process.env.RESET_PASSWORD_URL}?token=${token}`,
        },
      },
    });

    return formatResponse(
      user,
      res,
      HttpStatus.OK,
      false,
      'Password reset link sent successfully',
    );
  }

  /**
   * Change password.
   * @param changePasswordDto
   * @param {Response} res - Response object.
   * @param bearerToken
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @Post('change-password')
  @ApiOkResponse({ description: 'Password changed successfully' })
  @ApiUnauthorizedResponse({
    description: 'Not authorized, Invalid/expired token',
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') bearerToken: string,
  ): Promise<IAPIResponse> {
    let token = null;
    if (changePasswordDto.token) token = changePasswordDto.token;
    if (bearerToken) token = bearerToken.slice(7);

    if (!token) {
      return formatResponse(
        'Token is required in either the head or body of request',
        res,
        HttpStatus.UNAUTHORIZED,
        true,
        'No token found',
      );
    }

    const user = await this.authService.changePassword(
      token,
      changePasswordDto,
    );

    if (user === 1) {
      return formatResponse(
        'Invalid/expired token',
        res,
        HttpStatus.UNAUTHORIZED,
        true,
        'Invalid token',
      );
    }
    if (user === 2) {
      return formatResponse(
        'User record not found',
        res,
        HttpStatus.NOT_FOUND,
        true,
        'Invalid token',
      );
    }
    if (user === 3) {
      return formatResponse(
        'Old password is not correct',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Wrong password',
      );
    }
    return formatResponse(
      user,
      res,
      HttpStatus.OK,
      false,
      'Password changed successfully',
    );
  }

  /**
   * Pusher user authentication.
   * @param {Body} pusherUserAuthDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('pusher-user')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'User authenticated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async pusherUserAuth(
    @Request() req,
    @Body() pusherUserAuthDto: PusherUserAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const userId = req.user.id ? req.user.id : req.user.userId;
    const user = await this.usersService.findUser({ id: userId });
    if (!user) {
      return formatResponse(
        'User record not found',
        res,
        HttpStatus.NOT_FOUND,
        true,
        'Invalid token',
      );
    }
    const userData = {
      id: userId,
      email: user.email,
      fullname: `${user.lastName} ${user.firstName}`,
    };
    const authUser = pusher.authenticateUser(
      pusherUserAuthDto.socket_id,
      userData,
    );
    res.status(200);
    res.send(authUser);
  }

  /**
   * Pusher user channel authentication.
   * @param {Body} pusherChannelAuthDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('pusher-channel')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'User added to pusher channel successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async pusherChannelAuth(
    @Request() req,
    @Body() pusherChannelAuthDto: PusherChannelAuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const userId = req.user.id ? req.user.id : req.user.userId;
    const user = await this.usersService.findUser({ id: userId });
    if (!user) {
      return formatResponse(
        'User record not found',
        res,
        HttpStatus.NOT_FOUND,
        true,
        'Invalid token',
      );
    }
    const presenceData = {
      user_id: user.id,
      user_info: {
        fullname: `${user.lastName} ${user.firstName}`,
      },
    };
    const auth = pusher.authorizeChannel(
      pusherChannelAuthDto.socket_id,
      pusherChannelAuthDto.channel_name,
      presenceData,
    );
    res.status(200);
    res.send(auth);
  }
}
