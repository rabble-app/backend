import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  customTableLayout,
  getPDFPrinter,
  horizontalLine,
  invoiceHeaderLayout,
  itemsTableLayout,
  summaryTableLayout,
  totalTableLayout,
} from './helper';

const items = [
  {
    skuCode: 'GH-45-67',
    productName: 'BOX OF GINO MARCHE',
    measure: '6 x 750ML',
    unitCost: '£60.00',
    quantity: 'x4',
    totalExVAT: '£240.00',
    totalIncVAT: '£288.00',
  },
  {
    skuCode: 'GH-45-67',
    productName: 'BOX OF GINO MARCHE',
    measure: '6 x 750ML',
    unitCost: '£60.00',
    quantity: 'x4',
    totalExVAT: '£240.00',
    totalIncVAT: '£288.00',
  },
  {
    skuCode: 'GH-45-67',
    productName: 'BOX OF GINO MARCHE',
    measure: '6 x 750ML',
    unitCost: '£60.00',
    quantity: 'x4',
    totalExVAT: '£240.00',
    totalIncVAT: '£288.00',
  },
  {
    skuCode: 'GH-45-67',
    productName: 'BOX OF GINO MARCHE',
    measure: '6 x 750ML',
    unitCost: '£60.00',
    quantity: 'x4',
    totalExVAT: '£240.00',
    totalIncVAT: '£288.00',
  },
  {
    skuCode: 'GH-45-67',
    productName: 'BOX OF GINO MARCHE',
    measure: '6 x 750ML',
    unitCost: '£60.00',
    quantity: 'x4',
    totalExVAT: '£240.00',
    totalIncVAT: '£288.00',
  },
];
export const section1: Content = {
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
                    text: 'Flying Horse Coffee',
                    alignment: 'left',
                    color: '#101828',
                    bold: true,
                    fontSize: 12,
                  },
                ],
                [
                  {
                    text: '22 Welbeck Street',
                    alignment: 'left',
                    color: '#334054',
                    fontSize: 10,
                  },
                ],
                [
                  {
                    text: 'London',
                    alignment: 'left',
                    color: '#334054',
                    fontSize: 10,
                  },
                ],
                [
                  {
                    text: 'N1 4ET',
                    alignment: 'left',
                    color: '#334054',
                    fontSize: 10,
                  },
                ],
                [
                  {
                    text: 'VAT# 91739719739',
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
                    text: '00000',
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
                    text: '01/01/2021',
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
                    text: '01/01/2021',
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
                    text: '01/01/2021',
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

export const section2: Content = {
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
                    text: 'Maxwell Beard',
                    alignment: 'left',
                    color: '#101828',
                    fontSize: 12,
                    bold: true,
                  },
                ],
                [
                  {
                    text: '4 Alpha Street',
                    alignment: 'left',
                    color: '#334054',
                    fontSize: 10,
                  },
                ],
                [
                  {
                    text: 'London',
                    alignment: 'left',
                    color: '#334054',
                    fontSize: 10,
                  },
                ],
                [
                  {
                    text: 'SE15 2NX',
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
const invoiceHeader: Content = {
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
                    text: 'Chimpalu',
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
                    text: '00000',
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
                    text: '01/01/2021',
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

const itemsTable: Content = {
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
      ...items.map((item) => [
        { text: item.skuCode, style: 'itemStyle' },
        { text: item.productName, style: 'itemStyle' },
        { text: item.measure, style: 'itemStyle' },
        { text: item.unitCost, style: 'itemStyle' },
        { text: item.quantity, style: 'itemStyle' },
        { text: item.totalExVAT, style: 'itemStyle' },
        { text: item.totalIncVAT, style: 'itemStyle' },
      ]),
    ],
  },
  layout: itemsTableLayout,
};

const invoiceSummary: Content = {
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
                    text: '£484.00',
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
                    text: '£240.00',
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
};

const invoiceTotal: Content = {
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
                    text: '£724.00',
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
};
export const generateInvoicePDF = async () => {
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A3',
    content: [
      invoiceHeader,
      section1,
      horizontalLine,
      section2,
      itemsTable,
      invoiceSummary,
      invoiceTotal,
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      headerStyle: {
        margin: [0, 5, 0, 15],
      },
      tableOpacityExample: {
        margin: [0, 5, 0, 15],
        fillColor: 'blue',
        fillOpacity: 0.3,
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
    },
    defaultStyle: {
      // alignment: 'justify'
    },
  };
  const pdfPrinter = getPDFPrinter();
  return pdfPrinter.createPdfKitDocument(docDefinition);
};
