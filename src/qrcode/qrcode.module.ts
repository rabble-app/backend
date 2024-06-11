import { Module } from '@nestjs/common';
import { UploadsService } from '../uploads/uploads.service';
import { UploadsModule } from '../uploads/uploads.module';
import { QRCodeService } from './qrcode.service';
import { QRCodeController } from './qrcode.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [QRCodeController],
  providers: [UploadsService, QRCodeService, JwtService],
  imports: [UploadsModule],
  exports: [QRCodeService],
})
export class QRCodeModule {}
