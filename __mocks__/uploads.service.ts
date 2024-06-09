export const UploadsService = {
  uploadFile: jest.fn().mockResolvedValue({
    Location: 'https://example.com/mock-image.jpg',
    Key: 'mock-image-key',
  }),
  uploadQRCode: jest.fn().mockResolvedValue({
    Location: 'https://example.com/mock-qr-code.png',
    Key: 'mock-qr-code-key',
  }),
};
