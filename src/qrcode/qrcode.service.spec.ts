import { Test, TestingModule } from '@nestjs/testing';
import { QRCodeService } from './qrcode.service';
import { UploadsService } from '../uploads/uploads.service';
import { UploadsService as MockedUploadsService } from '../../__mocks__/uploads.service';
describe('QRCodeService', () => {
  let service: QRCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QRCodeService,
        {
          provide: UploadsService,
          useValue: MockedUploadsService,
        },
      ],
    }).compile();

    service = module.get<QRCodeService>(QRCodeService);
  });

  it('should generate a QR code with the correct data', async () => {
    const data = 'https://example.com';
    const result = await service.generateQRCode(data);
    expect(result).toEqual({
      qrCodeUrl: 'https://example.com/mock-qr-code.png',
      qrCodeKey: 'mock-qr-code-key',
    });
  });
});
