import { Injectable } from '@nestjs/common';
import { SendOTPDto } from './dto/send-otp.dto';
import * as twilio from 'twilio';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async sendOTP(sendOTPDto: SendOTPDto): Promise<string> {
    try {
      const client = twilio(
        process.env.TWILO_SID,
        process.env.TWILO_AUTH_TOKEN,
      );
      // create a verification service
      const result = await client.verify.v2.services.create({
        friendlyName: 'Rabble App',
      });
      // send a verification token
      await client.verify.v2
        .services(result.sid)
        .verifications.create({ to: sendOTPDto.phone, channel: 'sms' });
      return result.sid;
    } catch (error) {}
  }

  async verifyOTP(verifyOTPDto: VerifyOTPDto): Promise<boolean | object> {
    try {
      const client = twilio(
        process.env.TWILO_SID,
        process.env.TWILO_AUTH_TOKEN,
      );
      // verify token
      const result = await client.verify.v2
        .services(verifyOTPDto.sid)
        .verificationChecks.create({
          to: verifyOTPDto.phone,
          code: verifyOTPDto.code,
        });

      if (result['status'] == 'approved') {
        const userExist = await this.userService.findUser({
          phone: verifyOTPDto.phone,
        });
        const token = this.generateToken(verifyOTPDto.phone);
        if (userExist) {
          userExist['token'] = token;
          return userExist;
        } else {
          const newUser = await this.userService.createUser({
            phone: verifyOTPDto.phone,
          });
          newUser['token'] = token;
          return newUser;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  generateToken(data: any): string {
    return this.jwtService.sign(data);
  }

  decodeToken(token: string): string | any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }
}
