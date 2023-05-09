import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { PrismaService } from '../prisma.service';
import { PaymentModule } from '../payment/payment.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PaymentModule, UsersModule],
  controllers: [TeamsController],
  providers: [TeamsService, PrismaService],
})
export class TeamsModule {}
