import * as bcrypt from 'bcrypt';
import * as twilio from 'twilio';
import ChangePasswordDto from './dto/change-password.dto';
import { CreateProducerDto } from './dto/create-producer.dto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginProducerDto } from './dto/login-producer.dto';
import { PaymentService } from '../payment/payment.service';
import { PrismaService } from '../prisma.service';
import { Producer, User } from '@prisma/client';
import { SendOTPDto } from './dto/send-otp.dto';
import { UsersService } from '../users/users.service';
import { VerifyOTPDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly paymentService: PaymentService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async sendOTP(sendOTPDto: SendOTPDto): Promise<string> {
    try {
      const client = twilio(
        process.env.TWILO_SID,
        process.env.TWILO_AUTH_TOKEN,
      );
      // create a verification service
      const result = await client.verify.v2.services.create({
        friendlyName: 'Rabble',
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
          // create stripe account for user
          const stripeResponse = await this.paymentService.createCustomer(
            verifyOTPDto.phone,
          );
          const newUser = await this.userService.createUser({
            phone: verifyOTPDto.phone,
            stripeCustomerId: stripeResponse.id,
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
    return this.jwtService.sign(data, { secret: process.env.JWT_SECRET });
  }

  decodeToken(token: string): string | any {
    try {
      return this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    } catch (error) {
      return null;
    }
  }

  async quitApp(id: string) {
    try {
      return await this.prisma.user.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async registerProducer(
    createProducerDto: CreateProducerDto,
  ): Promise<Producer> {
    // encrypt password
    const password = await this.encryptPassword(createProducerDto.password);

    // save user record
    const userRecord = await this.prisma.user.create({
      data: {
        password,
        email: createProducerDto.email,
        phone: createProducerDto.phone,
        role: 'PRODUCER',
      },
    });

    // save producer record
    const producerRecord = await this.prisma.producer.create({
      data: {
        userId: userRecord.id,
        businessName: createProducerDto.businessName,
        businessAddress: createProducerDto.businessAddress,
      },
    });
    const token = this.generateToken({
      userId: userRecord.id,
      producerId: producerRecord.id,
    });
    producerRecord['token'] = token;

    // todo: send mail

    return producerRecord;
  }

  async loginProducer(
    loginProducerDto: LoginProducerDto,
  ): Promise<object | null> {
    // get the user record
    const user = await this.userService.findUser({
      email: loginProducerDto.email,
    });
    if (!user) return null;

    // confirm password
    const isMatch = await bcrypt.compare(
      loginProducerDto.password,
      user.password,
    );
    if (!isMatch) return null;

    // get producer record
    const producerRecord = await this.userService.findProducer({
      userId: user.id,
    });

    const token = this.generateToken({
      userId: user.id,
      producerId: producerRecord.id,
    });
    producerRecord['token'] = token;
    return producerRecord;
  }

  async emailVerification(token: string): Promise<Producer | null> {
    const validToken = this.decodeToken(token);
    if (!validToken) {
      return null;
    }

    const userInfo = await this.userService.findProducer({
      id: validToken.producerId,
    });
    if (!userInfo) {
      return null;
    }

    userInfo.isVerified = true;

    return await this.userService.updateProducer({
      where: {
        id: validToken.producerId,
      },
      data: {
        isVerified: true,
      },
    });
  }

  async changePassword(
    token: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User | number> {
    const validToken = this.decodeToken(token);
    if (!validToken) {
      return 1;
    }

    const userInfo = await this.userService.findUser({
      id: validToken.userId,
    });
    if (!userInfo) {
      return 2;
    }

    if (
      changePasswordDto.channel !== 'PASSWORD_RESET' &&
      userInfo.password &&
      changePasswordDto.oldPassword
    ) {
      // validate that the old password supplied is correct
      const checkPassword = await bcrypt.compare(
        changePasswordDto.oldPassword,
        userInfo.password,
      );
      if (!checkPassword) return 3;
    }

    const password = await this.encryptPassword(changePasswordDto.newPassword);

    return await this.userService.updateUser({
      where: {
        id: validToken.userId,
      },
      data: {
        password,
      },
    });
  }

  async encryptPassword(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(pass, salt);
  }
}
