import { Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ReferralsController],
  providers: [ReferralsService, UsersService, PrismaService, JwtService],
})
export class ReferralsModule {}
