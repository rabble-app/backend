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
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiResponse,
  ApiProduces,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('invoices')
@Controller('invoices')
@ApiBearerAuth()
@ApiProduces('application/pdf')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @UseGuards(AuthGuard)
  @Get('/:orderId/:producerId')
  @ApiParam({ name: 'orderId', type: String, required: true })
  @ApiParam({ name: 'producerId', type: String, required: true })
  @ApiOkResponse({ description: 'Invoice generated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBadRequestResponse({
    description: 'Order ID and Producer ID are required',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF Document',
    type: 'application/pdf',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <access_token>',
  })
  async getInvoices(
    @Param('orderId') orderId: string,
    @Param('producerId') producerId: string,
    @Res() res: Response,
  ) {
    try {
      if (!orderId || !producerId) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Order ID and Producer ID are required' });
      }
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
