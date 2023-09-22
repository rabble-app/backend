import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { PrismaService } from '../prisma.service';
import { PaymentModule } from '../payment/payment.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { ScheduleServiceExtended } from './schedule.service.extended';
import { TeamsModule } from '../teams/teams.module';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, PrismaService, ScheduleServiceExtended],
  imports: [
    PaymentModule,
    NotificationsModule,
    ProductsModule,
    UsersModule,
    TeamsModule,
  ],
})
export class ScheduleModule {}
