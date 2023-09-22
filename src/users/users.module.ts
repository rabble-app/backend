import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { UsersControllerExtension } from './users.controller.extension';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [UsersController, UsersControllerExtension],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
