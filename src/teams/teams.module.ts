import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PrismaService } from '../prisma.service';
import { PaymentModule } from '../payment/payment.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { TeamsServiceExtension } from './teams.service.extension';
import { TeamsServiceExtension2 } from './teams.service.extension2';
import { TeamsControllerExtension } from './teams.controller.extension';

@Module({
  imports: [PaymentModule, UsersModule, NotificationsModule],
  controllers: [TeamsController, TeamsControllerExtension],
  providers: [
    TeamsService,
    PrismaService,
    AuthService,
    JwtService,
    TeamsServiceExtension,
    TeamsServiceExtension2,
  ],
  exports: [TeamsService],
})
export class TeamsModule {}
