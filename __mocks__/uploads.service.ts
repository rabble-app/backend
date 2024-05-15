export const UploadsService = jest.fn().mockImplementation(() => ({
  uploadFile: jest.fn().mockResolvedValue({
    Location: 'https://example.com/mock-image.jpg',
    Key: 'mock-image-key',
  }),
}));
