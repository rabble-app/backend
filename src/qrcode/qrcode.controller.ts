import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { QRCodeService } from './qrcode.service';
import { IAPIResponse } from 'lib/types';
import { Response } from 'express';
import { formatResponse } from '../lib/helpers';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('qrcodes')
@Controller('qrcodes')
@ApiBearerAuth()
export class QRCodeController {
  constructor(private readonly qrCodeService: QRCodeService) {}

  /**
   * Generates a QR code image based on the provided data.
   *
   * @param data - The data to be encoded in the QR code.
   */
  @UseGuards(AuthGuard)
  @Post('generate')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          example: 'https://www.example.com',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'QR code generated successfully',
    schema: {
      type: 'object',
      properties: {
        qrCodeUrl: {
          type: 'string',
          example: 'https://example.com/qr-codes/1234567890',
        },
        qrCodeKey: {
          type: 'string',
          example: '1234567890',
        },
      },
    },
  })
  async generateQRCode(
    @Body('data') data: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const qrCode = await this.qrCodeService.generateQRCode(data);
    return formatResponse(qrCode, res, HttpStatus.OK, false);
  }
}
