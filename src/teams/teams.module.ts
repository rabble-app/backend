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
import { AuthModule } from '../../src/auth/auth.module';
import { TeamsControllerExtension2 } from './teams.controller.extension2';
import { ProductsModule } from '../../src/products/products.module';

@Module({
  imports: [
    forwardRef(() => PaymentModule),
    UsersModule,
    NotificationsModule,
    forwardRef(() => AuthModule),
    ProductsModule,
  ],
  controllers: [
    TeamsController,
    TeamsControllerExtension,
    TeamsControllerExtension2,
  ],
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
