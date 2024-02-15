import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import { InvoiceService } from './invoices.service';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async getInvoices(
    @Param('orderId') orderId: string,
    @Param('producerId') producerId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const pdfDoc = await this.invoiceService.generateInvoice(
        producerId,
        orderId,
      );
      const file = fs.createReadStream(pdfDoc);
      file.on('end', () => {
        fs.unlinkSync(pdfDoc);
      });
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="invoice.pdf"',
      });
      return new StreamableFile(file);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error generating invoice', error: error.message });
    }
  }
}
