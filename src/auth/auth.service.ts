import * as twilio from 'twilio';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PaymentService } from '../payment/payment.service';
import { PrismaService } from '../prisma.service';
import { SendOTPDto } from './dto/send-otp.dto';
import { UsersService } from '../users/users.service';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { CreateProducerDto } from './dto/create-producer.dto';
import { Producer } from '@prisma/client';
import { LoginProducerDto } from './dto/login-producer.dto';

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
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createProducerDto.password, salt);

    // save user record
    const userRecord = await this.prisma.user.create({
      data: {
        email: createProducerDto.email,
        phone: createProducerDto.phone,
        password: hash,
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
}
