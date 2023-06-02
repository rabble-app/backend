import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PrismaService } from '../prisma.service';
import { PaymentModule } from '../payment/payment.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PaymentModule, UsersModule, NotificationsModule],
  controllers: [TeamsController],
  providers: [TeamsService, PrismaService, AuthService, JwtService],
  exports: [TeamsService],
})
export class TeamsModule {}
