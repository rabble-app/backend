import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from './firebase.service';
import { CourierService } from './courier.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    PrismaService,
    JwtService,
    FirebaseService,
    CourierService,
  ],
  exports: [NotificationsService, FirebaseService, CourierService],
})
export class NotificationsModule {}
