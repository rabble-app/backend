import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import fs from 'fs';
import * as path from 'path';
import { generateInvoicePDF } from 'utils/pdf/invoice';
@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async generateInvoice(producerId: string, orderId: string) {
    const pdfDoc = await generateInvoicePDF();
    const fileName = `invoice-${orderId}-${new Date()}.pdf`;
    pdfDoc.pipe(fs.createWriteStream(`public/pdfs/${fileName}`));
    pdfDoc.end();
    const filePath = path.resolve(
      __dirname,
      `../../../public/pdfs/${fileName}`,
    );
    return filePath;
  }
}
