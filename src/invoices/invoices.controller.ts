import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { InvoiceService } from './invoices.service';
import { AuthGuard } from 'auth/auth.guard';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @UseGuards(AuthGuard)
  @Get('/:orderId/:producerId')
  async getInvoices(
    @Param('orderId') orderId: string,
    @Param('producerId') producerId: string,
    @Res() res: Response,
  ) {
    try {
      const pdfDoc = await this.invoiceService.generateInvoice(
        producerId,
        orderId,
      );
      const fileName = `invoice-${orderId}-${new Date().getTime()}.pdf`;
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error generating invoice', error: error.message });
    }
  }
}
