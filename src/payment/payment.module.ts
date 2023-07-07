import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma.service';
import { PaymentControllerExtension } from './payment.controller.extension';

@Module({
  imports: [UsersModule],
  controllers: [PaymentController, PaymentControllerExtension],
  providers: [PaymentService, PrismaService],
  exports: [PaymentService],
})
export class PaymentModule {}
