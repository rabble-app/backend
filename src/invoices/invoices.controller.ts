import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { InvoiceService } from './invoices.service';
import { AuthGuard } from '../auth/auth.guard';
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
import { InvoiceEmailDto } from './dto/invoice-data.dto';

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
      const { pdfDoc } = await this.invoiceService.generateInvoice(
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

  @UseGuards(AuthGuard)
  @Post('email')
  @ApiOkResponse({ description: 'Invoice emailed successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBadRequestResponse({
    description: 'Order ID and Producer ID are required',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <access_token>',
  })
  async emailInvoices(
    @Body() { orderId, producerId }: InvoiceEmailDto,
    @Res() res: Response,
  ) {
    try {
      if (!orderId || !producerId) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Order ID and Producer ID are required' });
      }
      const { pdfDoc, orderDetails } =
        await this.invoiceService.generateInvoice(producerId, orderId);
      const response = await this.invoiceService.sendInvoiceByEmail(
        pdfDoc,
        orderId,
        orderDetails.team.producer.businessName,
        orderDetails.team.producer.accountsEmail,
      );
      if (!response.messageId) {
        throw new Error('Error sending invoice');
      }
      return res
        .status(HttpStatus.OK)
        .json({ message: 'Invoice emailed successfully' });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error Emailing invoice', error: error.message });
    }
  }
}
