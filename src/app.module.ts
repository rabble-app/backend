import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { ProductsModule } from './products/products.module';
import { PaymentModule } from './payment/payment.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ChatsModule } from './chats/chats.module';
import { JwtModule } from '@nestjs/jwt';
import { ParametersModule } from './config/config.module';
import { WebhookModule } from './webhook/webhook.module';
import { InvoicesModule } from 'invoices/invoices.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TeamsModule,
    ProductsModule,
    PaymentModule,
    NotificationsModule,
    UploadsModule,
    ScheduleModule,
    ChatsModule,
    ParametersModule,
    InvoicesModule,
    JwtModule.registerAsync({
      useFactory: async (parameters: Record<string, any>) => ({
        secret: parameters.JWT_SECRET,
      }),
      inject: ['AWS_PARAMETERS'],
    }),
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
