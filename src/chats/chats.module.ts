import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { PrismaService } from '../../src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ChatsController],
  providers: [ChatsService, PrismaService, JwtService],
})
export class ChatsModule {}
