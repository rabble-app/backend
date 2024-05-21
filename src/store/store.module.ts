import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UploadsService } from '../uploads/uploads.service';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  controllers: [StoreController],
  providers: [StoreService, PrismaService, JwtService, UploadsService],
  imports: [UploadsModule],
})
export class StoreModule {}
