import { Module, forwardRef } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PrismaService } from '../prisma.service';
import { PaymentModule } from '../payment/payment.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtService } from '@nestjs/jwt';
import { TeamsServiceExtension } from './teams.service.extension';
import { TeamsServiceExtension2 } from './teams.service.extension2';
import { TeamsControllerExtension } from './teams.controller.extension';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => PaymentModule),
    UsersModule,
    NotificationsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [TeamsController, TeamsControllerExtension],
  providers: [
    TeamsService,
    PrismaService,
    JwtService,
    TeamsServiceExtension,
    TeamsServiceExtension2,
  ],
  exports: [TeamsService, TeamsServiceExtension],
})
export class TeamsModule {}
