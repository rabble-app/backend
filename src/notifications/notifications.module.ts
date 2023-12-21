import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService, JwtService],
  exports: [NotificationsService],
  imports: [ConfigModule],
})
export class NotificationsModule {}
