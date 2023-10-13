import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { UsersControllerExtension } from './users.controller.extension';
import { JwtModule } from '@nestjs/jwt';
import { PaymentModule } from '../../src/payment/payment.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    // PaymentModule
    // forwardRef(() => PaymentModule),
  ],
  controllers: [UsersController, UsersControllerExtension],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
