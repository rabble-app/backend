import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma.service';
import { PaymentControllerExtension } from './payment.controller.extension';
import { PaymentServiceExtension } from './payment.service.extension';

@Module({
  imports: [UsersModule],
  controllers: [PaymentController, PaymentControllerExtension],
  providers: [PaymentService, PrismaService, PaymentServiceExtension],
  exports: [PaymentService, PaymentServiceExtension],
})
export class PaymentModule {}
