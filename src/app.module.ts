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
import { ParametersModule } from './parameters.module';

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
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
