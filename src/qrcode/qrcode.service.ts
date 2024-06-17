import { Injectable } from '@nestjs/common';
import QRCode from 'qrcode';
import { UploadsService } from '../uploads/uploads.service';
@Injectable()
export class QRCodeService {
  constructor(private readonly uploadsService: UploadsService) {}

  async generateQRCode(data: string) {
    const qrCode = await QRCode.toBuffer(data, {
      type: 'png',
      width: 400,
    });
    const { Key, Location } = await this.uploadsService.uploadQRCode(
      qrCode,
      data,
    );
    return { qrCodeUrl: Location, qrCodeKey: Key };
  }
}
