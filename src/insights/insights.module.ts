import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [InsightsController],
  providers: [InsightsService, PrismaService, JwtService],
  exports: [InsightsService],
})
export class InsightsModule {}
