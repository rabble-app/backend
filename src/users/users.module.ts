import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { UsersControllerExtension } from './users.controller.extension';
import { JwtService } from '@nestjs/jwt';
import { UsersServiceExtension } from './users.service.extension';

@Module({
  controllers: [UsersController, UsersControllerExtension],
  providers: [UsersService, UsersServiceExtension, PrismaService, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
