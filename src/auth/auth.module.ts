import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PaymentModule } from '../payment/payment.module';
import { PrismaService } from '../prisma.service';
import { UsersModule } from '../users/users.module';
import { AuthControllerExtension } from './auth.controller.extension';

@Module({
  imports: [UsersModule, PaymentModule],
  controllers: [AuthController, AuthControllerExtension],
  providers: [AuthService, PrismaService, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
