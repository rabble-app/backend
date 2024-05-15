export const UploadsService = {
  uploadFile: jest.fn().mockResolvedValue({
    Location: 'https://example.com/mock-image.jpg',
    Key: 'mock-image-key',
  }),
};
