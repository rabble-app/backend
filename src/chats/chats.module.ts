import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { PrismaService } from '../../src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsModule } from '../../src/notifications/notifications.module';
import { TeamsModule } from '../../src/teams/teams.module';
import { UsersModule } from '../../src/users/users.module';

@Module({
  controllers: [ChatsController],
  providers: [ChatsService, PrismaService, JwtService],
  imports: [NotificationsModule, TeamsModule, UsersModule],
})
export class ChatsModule {}
