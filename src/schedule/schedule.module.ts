import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { PrismaService } from '../prisma.service';
import { PaymentModule } from '../payment/payment.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersService } from 'src/users/users.service';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, PrismaService, UsersService],
  imports: [PaymentModule, NotificationsModule, ProductsModule],
})
export class ScheduleModule {}
