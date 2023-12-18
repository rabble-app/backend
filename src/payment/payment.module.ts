import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma.service';
import { PaymentControllerExtension } from './payment.controller.extension';
import { PaymentServiceExtension } from './payment.service.extension';
import { NotificationsModule } from '../notifications/notifications.module';
import { TeamsModule } from '../teams/teams.module';
import { ProductsModule } from '../../src/products/products.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    NotificationsModule,
    forwardRef(() => TeamsModule),
    ProductsModule,
  ],
  controllers: [PaymentController, PaymentControllerExtension],
  providers: [
    PaymentService,
    PrismaService,
    PaymentServiceExtension,
    JwtService,
  ],
  exports: [PaymentService, PaymentServiceExtension],
})
export class PaymentModule {}
