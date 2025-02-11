import * as bcrypt from 'bcrypt';
import twilio from 'twilio';
import Stripe from 'stripe';
import ChangePasswordDto from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from '../prisma.service';
import { Producer, User } from '@prisma/client';
import { SendOTPDto } from './dto/send-otp.dto';
import { UsersService } from '../users/users.service';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { courier } from '../../src/utils/mail';
import { Role, UserWithProducerAndPartnerInfo } from '../../src/lib/types';
import { ICourierClient } from '@trycourier/courier';

@Injectable()
export class AuthService {
  private courierClient: ICourierClient;
  private readonly stripe: Stripe;
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
  ) {
    this.courierClient = courier(this.parameters.COURIER_API);
    this.stripe = new Stripe(this.parameters.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  async sendOTP(sendOTPDto: SendOTPDto): Promise<string> {
    try {
      const client = twilio(
        this.parameters.TWILO_SID,
        this.parameters.TWILO_AUTH_TOKEN,
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
    } catch (error) {
      console.log(error);
    }
  }

  async verifyOTP(verifyOTPDto: VerifyOTPDto): Promise<boolean | object> {
    try {
      const client = twilio(
        this.parameters.TWILO_SID,
        this.parameters.TWILO_AUTH_TOKEN,
      );
      // verify token
      const result = await client.verify.v2
        .services(verifyOTPDto.sid)
        .verificationChecks.create({
          to: verifyOTPDto.phone,
          code: verifyOTPDto.code,
        });

      if (
        result['status'] == 'approved' ||
        verifyOTPDto.phone == '+2347000000000' // Todo: remove test logic
      ) {
        let userExist: UserWithProducerAndPartnerInfo | User;
        userExist = await this.userService.findUser({
          phone: verifyOTPDto.phone,
        });
        if (userExist) {
          const token = this.generateToken({
            phone: verifyOTPDto.phone,
            userId: userExist.id,
            role: userExist.role,
          });
          userExist['token'] = token;
        } else {
          let stripeCustomerId = null;
          let role = Role.USER;
          if (verifyOTPDto.role != Role.PARTNER) {
            // create stripe account for user
            const stripeResponse = await this.userService.createStripeCustomer({
              phone: verifyOTPDto.phone,
            });
            stripeCustomerId = stripeResponse.id;
          } else {
            role = verifyOTPDto.role;
          }
          userExist = await this.userService.createUser({
            role,
            stripeCustomerId,
            phone: verifyOTPDto.phone,
          });
          const token = this.generateToken({
            phone: verifyOTPDto.phone,
            userId: userExist.id,
            role,
          });

          userExist['token'] = token;
        }
        // add firebase push notification token
        if (verifyOTPDto.notificationToken) {
          await this.userService.updateUser({
            where: {
              id: userExist.id,
            },
            data: {
              notificationToken: verifyOTPDto.notificationToken,
            },
          });
        }
        return userExist;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  generateToken(data: any) {
    return this.jwtService.sign(data, {
      secret: this.parameters.JWT_SECRET,
    });
  }

  decodeToken(token: string): string | any {
    try {
      return this.jwtService.verify(token, {
        secret: this.parameters.JWT_SECRET,
      });
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

  async registerUser(createUserDto: CreateUserDto): Promise<Producer | User> {
    let producerRecord: Producer = undefined;
    let stripeCustomerId: string = undefined;
    let referrerId: string = undefined;

    // encrypt password
    const password = await this.encryptPassword(createUserDto.password);

    if (createUserDto.role && createUserDto.role == Role.USER) {
      // create user stripe account
      const stripeResponse = await this.userService.createStripeCustomer({
        email: createUserDto.email,
      });
      stripeCustomerId = stripeResponse.id;
    }

    // verify referrer
    if (createUserDto.referralCode) {
      const referrer = await this.userService.findUser({
        refCode: createUserDto.referralCode,
      });
      referrerId = referrer?.id;
    }

    // save user record
    const userRecord = await this.prisma.user.create({
      data: {
        referrerId,
        password,
        stripeCustomerId,
        email: createUserDto.email,
        phone: createUserDto.phone ? createUserDto.phone : createUserDto.email,
        role: createUserDto.role ? createUserDto.role : 'PRODUCER',
      },
    });

    if (!createUserDto.role) {
      // save producer record
      producerRecord = await this.prisma.producer.create({
        data: {
          userId: userRecord.id,
          businessName: createUserDto.businessName,
          businessAddress: createUserDto.businessAddress,
        },
      });
    }

    const token = this.generateToken({
      userId: userRecord.id,
      producerId: producerRecord?.id,
    });

    if (!createUserDto.role) {
      producerRecord['businessEmail'] = createUserDto.email;
      producerRecord['token'] = token;
    } else {
      userRecord['token'] = token;
    }

    // send mail
    const url = !createUserDto.role
      ? `${this.parameters.EMAIL_URL}${this.parameters.CONFIRM_ACCOUNT_URL}?token=${token}`
      : `${this.parameters.SUPPLEMENT_EMAIL_URL}${this.parameters.SUPPLEMENT_CONFIRM_ACCOUNT_URL}?token=${token}`;
    await this.courierClient.send({
      message: {
        to: {
          email: userRecord.email,
        },
        template: `${this.parameters.EMAIL_VERIFICATION_TEMPLATE}`,
        data: {
          url,
        },
      },
    });

    if (!createUserDto.role) return producerRecord;
    else return userRecord;
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<object | null | string> {
    let producerRecord: Producer = undefined;
    // get the user record
    const user = await this.userService.findUser({
      email: loginUserDto.email,
    });
    if (!user) return null;

    // confirm password
    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
    if (
      !isMatch &&
      loginUserDto.password != 'rabble-info@flyinghorsecoffee.com' // Todo: remove the test password here
    )
      return null;

    if (!loginUserDto.role) {
      // get producer record
      producerRecord = await this.userService.findProducer({
        userId: user.id,
      });

      if (!producerRecord) return null;
      // check whether the user have verified their email
      if (!producerRecord.isVerified) {
        return 'not verified';
      }
    } else {
      if (!user.isVerified) {
        return 'not verified';
      }
    }

    const token = this.generateToken({
      userId: user.id,
      producerId: producerRecord?.id,
      role: user.role,
    });

    if (!loginUserDto.role) {
      producerRecord['token'] = token;
      producerRecord['businessEmail'] = user.email;
      return producerRecord;
    }
    user['token'] = token;
    return user;
  }

  async emailVerification(token: string, role: Role): Promise<Producer | null> {
    const validToken = this.decodeToken(token);
    let userInfo: Producer | User;
    let result;

    if (!validToken) {
      return null;
    }
    if (!role) {
      userInfo = await this.userService.findProducer({
        id: validToken.producerId,
      });
      if (!userInfo) {
        return null;
      }
      userInfo.isVerified = true;

      result = await this.userService.updateProducer({
        where: {
          id: validToken.producerId,
        },
        data: {
          isVerified: true,
        },
      });
    } else {
      userInfo = await this.userService.findUser({
        id: validToken.userId,
      });
      if (!userInfo) {
        return null;
      }
      userInfo.isVerified = true;

      result = await this.userService.updateUser({
        where: {
          id: validToken.userId,
        },
        data: {
          isVerified: true,
        },
      });
    }

    const userToken = this.generateToken({
      userId: role ? result.id : result.userId,
      producerId: role ? '' : result.id,
    });
    result['token'] = userToken;
    return result;
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

  async stripeOnboard(
    isPartner = false,
  ): Promise<{ url: string; accountId: string }> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'GB',
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
        bank_transfer_payments: {
          requested: true,
        },
      },
    });

    const accountLinkURL = await this.generateAccountLink(
      account.id,
      isPartner,
    );
    return {
      url: accountLinkURL,
      accountId: account.id,
    };
  }

  async stripeOnboardRefresh(
    accountId: string,
    isPartner = false,
  ): Promise<{ url: string; accountId: string }> {
    const accountLinkURL = await this.generateAccountLink(accountId, isPartner);
    return {
      url: accountLinkURL,
      accountId: accountId,
    };
  }

  async generateAccountLink(
    accountId: string,
    isPartner: boolean,
  ): Promise<string> {
    return this.stripe.accountLinks
      .create({
        type: 'account_onboarding',
        account: accountId,
        refresh_url: `${
          isPartner
            ? this.parameters.STRIPE_REFRESH_URL_PARTNER_HUB
            : this.parameters.STRIPE_REFRESH_URL
        }`,
        return_url: `${
          isPartner
            ? this.parameters.STRIPE_RETURN_URL_PARTNER_HUB
            : this.parameters.STRIPE_RETURN_URL
        }`,
      })
      .then((link) => link.url);
  }
}
