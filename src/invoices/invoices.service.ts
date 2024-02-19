import { Injectable } from '@nestjs/common';
import {
  Content,
  TDocumentDefinitions,
  StyleDictionary,
} from 'pdfmake/interfaces';
import * as path from 'path';
import { TeamsServiceExtension2 } from '../teams/teams.service.extension2';
import { OrderDetailsDto } from './dto/invoice-data.dto';
import { format } from 'date-fns';
import {
  getPDFPrinter,
  horizontalLine,
  invoiceHeaderLayout,
  itemsTableLayout,
  summaryTableLayout,
  totalTableLayout,
} from '../utils/pdf/helper';
@Injectable()
export class InvoiceService {
  constructor(
    private readonly teamsServiceExtension2: TeamsServiceExtension2,
  ) {}

  async generateInvoice(producerId: string, orderId: string) {
    const orderDetails = <OrderDetailsDto>(
      await this.teamsServiceExtension2.getOrderInvoiceDetails(
        orderId,
        producerId,
      )
    );
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A3',
      content: [
        this.getHeader(orderDetails.id.slice(0, 6), orderDetails.deliveryDate),
        this.getSection1(orderDetails),
        horizontalLine,
        this.getSection2(orderDetails),
        this.getItemsTable(orderDetails),
        ...this.getSummaryTable(orderDetails),
      ],
      styles: this.getStyles(),
      defaultStyle: {
        // alignment: 'justify'
      },
    };
    const pdfPrinter = getPDFPrinter();
    return pdfPrinter.createPdfKitDocument(docDefinition);
  }
  async generateLocalFileInvoicePDF(
    producerId: string,
    orderId: string,
  ): Promise<string> {
    const pdfDoc = await this.generateInvoice(producerId, orderId);
    const fileName = `invoice-${orderId}-${new Date()}.pdf`;
    pdfDoc.end();
    const filePath = path.resolve(
      __dirname,
      `../../../public/pdfs/${fileName}`,
    );
    return filePath;
  }

  getHeader(orderNo: string, deliveryDate?: string): Content {
    return {
      style: 'headerStyle',
      table: {
        widths: ['50%', '50%'],
        body: [
          [
            [
              {
                table: {
                  widths: ['100%'],
                  body: [
                    [
                      {
                        text: 'Rabble',
                        alignment: 'left',
                        color: '#D6F318',
                        bold: true,
                        fontSize: 38,
                      },
                    ],
                    [
                      {
                        text: 'The Team Buying Platform',
                        alignment: 'left',
                        color: '#D6F318',
                        bold: true,
                      },
                    ],
                  ],
                },
                layout: invoiceHeaderLayout,
              },
            ],
            [
              {
                table: {
                  widths: ['50%', '50%'],
                  body: [
                    [
                      {
                        text: 'Order N0:',
                        alignment: 'left',
                        color: '#FFFFFF',
                      },
                      {
                        text: orderNo,
                        color: '#D6F318',
                      },
                    ],
                    [
                      {
                        text: 'Delivery Date:',
                        alignment: 'left',
                        color: '#FFFFFF',
                      },
                      {
                        text: deliveryDate
                          ? format(new Date(deliveryDate), 'dd/MM/yyyy')
                          : '',
                        color: '#D6F318',
                      },
                    ],
                  ],
                },
                layout: invoiceHeaderLayout,
              },
            ],
          ],
        ],
      },
      layout: invoiceHeaderLayout,
    };
  }

  getSection1(orderDetails: OrderDetailsDto): Content {
    return {
      margin: [0, 5, 0, 25],
      table: {
        widths: ['40%', '40%', '20%'],
        body: [
          [
            [
              {
                table: {
                  widths: ['100%'],
                  body: [
                    [
                      {
                        text: orderDetails.team.producer.businessName,
                        alignment: 'left',
                        color: '#101828',
                        bold: true,
                        fontSize: 12,
                      },
                    ],
                    [
                      {
                        text: orderDetails.team.producer.businessAddress,
                        alignment: 'left',
                        color: '#334054',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: '',
                        alignment: 'left',
                        color: '#334054',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: '',
                        alignment: 'left',
                        color: '#334054',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: `VAT# ${orderDetails.team.producer.vat ?? ''}`,
                        alignment: 'left',
                        color: '#334054',
                        fontSize: 10,
                      },
                    ],
                  ],
                },
                layout: 'noBorders',
              },
            ],
            { text: '' },
            [
              {
                table: {
                  widths: ['50%', '50%'],
                  body: [
                    [
                      {
                        text: 'Invoice N0:',
                        alignment: 'left',
                        color: '#667085',
                        fontSize: 10,
                      },
                      {
                        text: orderDetails.id.slice(0, 6),
                        color: '#101828',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: 'Invoice Date:',
                        alignment: 'left',
                        color: '#667085',
                        fontSize: 10,
                      },
                      {
                        text: format(new Date(), 'dd/MM/yyyy'),
                        color: '#101828',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: 'Payment Terms:',
                        alignment: 'left',
                        color: '#667085',
                        fontSize: 10,
                      },
                      {
                        text: orderDetails.team.producer.paymentTerm,
                        color: '#101828',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: 'Payment Due:',
                        alignment: 'left',
                        color: '#667085',
                        fontSize: 10,
                      },
                      {
                        text: orderDetails.deadline
                          ? format(
                              new Date(orderDetails.deadline),
                              'dd/MM/yyyy',
                            )
                          : '',
                        color: '#101828',
                        fontSize: 10,
                        alignment: 'right',
                      },
                    ],
                  ],
                },
                layout: 'noBorders',
                alignment: 'right',
              },
            ],
          ],
        ],
      },
      layout: 'noBorders',
    };
  }

  getSection2(orderDetails: OrderDetailsDto): Content {
    return {
      margin: [0, 5, 0, 25],
      table: {
        widths: ['40%', '40%', '20%'],
        body: [
          [
            [
              {
                table: {
                  widths: ['100%'],
                  body: [
                    [
                      {
                        text: 'Delivery address',
                        alignment: 'left',
                        color: '#334054',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: `${orderDetails.team.host.firstName} ${orderDetails.team.host.lastName}`,
                        alignment: 'left',
                        color: '#101828',
                        fontSize: 12,
                        bold: true,
                      },
                    ],
                    [
                      {
                        text: `${
                          orderDetails.team.host.shipping.buildingNo ?? ''
                        } ${orderDetails.team.host.shipping.address}`,
                        alignment: 'left',
                        color: '#334054',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: orderDetails.team.host.shipping.city,
                        alignment: 'left',
                        color: '#334054',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: orderDetails.team.host.postalCode,
                        alignment: 'left',
                        color: '#334054',
                        fontSize: 10,
                      },
                    ],
                  ],
                },
                layout: 'noBorders',
              },
            ],
            { text: '' },
            [
              {
                table: {
                  widths: ['100%'],
                  body: [
                    [
                      {
                        text: 'Bill to',
                        alignment: 'left',
                        color: '#334054',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: 'Postcode Collective',
                        alignment: 'left',
                        color: '#101828',
                        fontSize: 12,
                        bold: true,
                      },
                    ],
                    [
                      {
                        text: 'Company number: 1471271',
                        alignment: 'left',
                        color: '#667085',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: '128 City Road',
                        alignment: 'left',
                        color: '#667085',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: 'London',
                        alignment: 'left',
                        color: '#667085',
                        fontSize: 10,
                      },
                    ],
                    [
                      {
                        text: 'EC1V 2NX',
                        alignment: 'left',
                        color: '#667085',
                        fontSize: 10,
                      },
                    ],
                  ],
                },
                layout: 'noBorders',
                alignment: 'right',
              },
            ],
          ],
        ],
      },
      layout: 'noBorders',
    };
  }
  getItemsTable(orderDetails: OrderDetailsDto): Content {
    return {
      style: 'itemsTable',
      table: {
        headerRows: 1,
        widths: ['15%', '25%', '10%', '10%', '10%', '15%', '15%'],
        body: [
          [
            { text: 'SKU Code', style: 'itemsHeader' },
            { text: 'Product Name', style: 'itemsHeader' },
            { text: 'Measure', style: 'itemsHeader' },
            { text: 'Unit Cost', style: 'itemsHeader' },
            { text: 'Quantity', style: 'itemsHeader' },
            { text: 'Total Ex VAT', style: 'itemsHeader' },
            { text: 'Total Inc VAT', style: 'itemsHeader' },
          ],
          ...orderDetails.productLog.map((item) => [
            { text: item.productSku, style: 'itemStyle' },
            { text: item.name, style: 'itemStyle' },
            {
              text: `${item.quantityOfSubUnitPerOrder}x${item.measuresPerSubUnit}${item.unitsOfMeasurePerSubUnit}`,
              style: 'itemStyle',
            },
            { text: `£${item.cost}`, style: 'itemStyle' },
            { text: `x${item.quantity}`, style: 'itemStyle' },
            { text: `£${item.quantity * +item.cost}`, style: 'itemStyle' },
            { text: `£${item.quantity * +item.cost}`, style: 'itemStyle' },
          ]),
        ],
      },
      layout: itemsTableLayout,
    };
  }

  getSummaryTable(orderDetails: OrderDetailsDto): Content[] {
    const subTotal = orderDetails.productLog.reduce(
      (acc, item) => acc + item.quantity * +item.cost,
      0,
    );
    const vat = orderDetails.productLog.reduce((acc, item) => {
      if (item.vat) {
        return acc + item.quantity * +item.cost * (+item.vat / 100);
      }
      return acc + 0;
    }, 0);
    return [
      {
        margin: [0, 25, 0, 25],
        table: {
          widths: ['70%', '30%'],
          body: [
            [
              '',
              [
                {
                  table: {
                    widths: ['50%', '50%'],
                    body: [
                      [
                        {
                          text: 'Subtotal',
                          alignment: 'left',
                          color: '#667085',
                          fontSize: 10,
                          bold: true,
                        },
                        {
                          text: `£${subTotal.toFixed(2)}`,
                          color: '#334054',
                          fontSize: 18,
                          bold: true,
                          alignment: 'right',
                        },
                      ],
                      [
                        {
                          text: 'VAT',
                          alignment: 'left',
                          color: '#667085',
                          fontSize: 10,
                          bold: true,
                        },
                        {
                          text: `£${vat.toFixed(2)}`,
                          color: '#334054',
                          fontSize: 18,
                          bold: true,
                          alignment: 'right',
                        },
                      ],
                    ],
                  },
                  layout: summaryTableLayout,
                },
              ],
            ],
          ],
        },
        layout: 'noBorders',
      },
      {
        margin: [0, 0, 0, 0],
        table: {
          widths: ['70%', '30%'],
          body: [
            [
              '',
              [
                {
                  table: {
                    widths: ['50%', '50%'],
                    body: [
                      [
                        {
                          text: 'Total',
                          alignment: 'left',
                          color: '#667085',
                          fontSize: 13,
                          bold: true,
                        },
                        {
                          text: `£${(subTotal + vat).toFixed(2)}`,
                          color: '#101828',
                          fontSize: 24,
                          bold: true,
                          alignment: 'right',
                        },
                      ],
                    ],
                  },
                  layout: totalTableLayout,
                },
              ],
            ],
          ],
        },
        layout: 'noBorders',
      },
    ];
  }

  getStyles(): StyleDictionary {
    return {
      headerStyle: {
        margin: [0, 5, 0, 15],
      },
      itemsTable: {
        margin: [0, 5, 0, 0],
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black',
      },
      itemsHeader: {
        bold: true,
        fontSize: 10,
        color: '#111118',
        margin: [0, 0, 0, 10],
      },
      itemStyle: {
        alignment: 'left',
        color: '#667085',
        fontSize: 9,
      },
    };
  }
}
