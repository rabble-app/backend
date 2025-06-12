import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Clean up database before tests
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up after tests
  await prisma.$disconnect();
});

// Increase timeout for all tests
jest.setTimeout(30000);
