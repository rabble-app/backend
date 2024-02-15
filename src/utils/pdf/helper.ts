import PdfPrinter from 'pdfmake';
import {
  ContentCanvas,
  ContentTable,
  CustomTableLayout,
  TFontDictionary,
} from 'pdfmake/interfaces';

export const customTableLayout: CustomTableLayout = {
  hLineWidth: function (i: number) {
    if (i === 0) {
      return 0;
    }
    return 1;
  },
  vLineWidth: function (i: number) {
    return 0;
  },
  hLineColor: '#ccc',
  paddingLeft: function (i: number) {
    return i === 0 ? 0 : 8;
  },
  paddingRight: function (i: number, node: ContentTable) {
    if (node.table.widths?.length && i === node.table.widths.length - 1) {
      return 0;
    }
    return 8;
  },
};

export const invoiceHeaderLayout: CustomTableLayout = {
  ...customTableLayout,
  hLineColor: 'black',
  vLineColor: 'black',
  fillColor: 'black',
  vLineWidth: function (i: number) {
    return 1;
  },
  fillOpacity: 1,
  paddingBottom: function (i: number) {
    return i === 0 ? 0 : 10;
  },
  paddingTop: function (i: number) {
    return i === 1 ? 5 : 10;
  },
  paddingLeft: function () {
    return 20;
  },
  paddingRight: function () {
    return 10;
  },
};

export const itemsTableLayout: CustomTableLayout = {
  ...customTableLayout,
  fillColor: function (rowIndex, node, columnIndex) {
    return rowIndex === 0 ? '#D0D5DD' : null;
  },
  paddingBottom: function (i: number) {
    return 10;
  },
  paddingTop: function (i: number) {
    return 10;
  },
  paddingLeft: function (i: number) {
    return 20;
  },
  fillOpacity: 0.2,
  hLineWidth: function (i: number) {
    if (i === 0 || i === 1) {
      return 1;
    }
    return 0;
  },
};

export const summaryTableLayout: CustomTableLayout = {
  ...customTableLayout,
  paddingBottom: function (i: number) {
    return 10;
  },
  paddingTop: function (i: number) {
    return 10;
  },
  paddingLeft: function (i: number) {
    return 10;
  },
  hLineWidth: function (i: number) {
    if (i === 0) {
      return 0;
    }
    return 1;
  },
};

export const totalTableLayout: CustomTableLayout = {
  ...customTableLayout,
  paddingBottom: function (i: number) {
    return 10;
  },
  paddingTop: function (i: number) {
    return 10;
  },
  paddingLeft: function (i: number) {
    return 10;
  },
  hLineWidth: function (i: number) {
    if (i === 0) {
      return 0;
    }
    return 4;
  },
};
export const horizontalLine: ContentCanvas = {
  canvas: [
    {
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 760.89,
      y2: 0,
      lineWidth: 1,
      lineColor: '#ccc',
    },
  ],
};

export const getPDFPrinter = (fonts?: TFontDictionary) => {
  const _fonts = {
    Roboto: {
      normal: 'public/assets/fonts/Lato-Regular.ttf',
      bold: 'public/assets/fonts/Lato-Bold.ttf',
      bolditalics: 'public/assets/fonts/Manrope-SemiBold.ttf',
    },
  };
  return new PdfPrinter(fonts ?? _fonts);
};
