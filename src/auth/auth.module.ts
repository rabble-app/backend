import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PaymentModule } from '../payment/payment.module';
import { PrismaService } from '../prisma.service';
import { UsersModule } from '../users/users.module';
import { AuthControllerExtension } from './auth.controller.extension';
import { ReferralsService } from '../referrals/referrals.service';
import { StripeService } from '../stripe/stripe.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [UsersModule, PaymentModule, JwtModule, NotificationsModule],
  controllers: [AuthController, AuthControllerExtension],
  providers: [
    AuthService,
    PrismaService,
    JwtService,
    ReferralsService,
    StripeService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
