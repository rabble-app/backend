import { Module } from '@nestjs/common';
import { PostalCodeService } from './postal-code.service';
import { PostalCodeController } from './postal-code.controller';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [PostalCodeController],
  providers: [PostalCodeService, PrismaService, JwtService],
})
export class PostalCodeModule {}
