import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { PrismaService } from '../prisma.service';
import { PaymentModule } from '../payment/payment.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, PrismaService],
  imports: [PaymentModule, NotificationsModule],
})
export class ScheduleModule {}