import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { UsersControllerExtension } from './users.controller.extension';

@Module({
  controllers: [UsersController, UsersControllerExtension],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
