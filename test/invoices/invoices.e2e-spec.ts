import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/auth/auth.service';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

let app: INestApplication;
let prisma: PrismaService;
let authService: AuthService;

const phone = faker.phone.number('101-###-###');
let teamId: string;
let producerId: string;
let orderId: string;
let customerId: string;
let userId: string;
let jwtToken: string;
const testTime = 120000;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  prisma = app.get<PrismaService>(PrismaService);
  authService = app.get<AuthService>(AuthService);

  await app.init();

  // create dummy user for test
  const user = await prisma.user.create({
    data: {
      phone,
      stripeCustomerId: customerId,
    },
  });
  userId = user.id;
  // create dummy producer for test
  const producer = await prisma.producer.create({
    data: {
      userId,
      businessName: faker.internet.userName(),
    },
  });
  producerId = producer.id;

  // create  team for test
  const team = await prisma.buyingTeam.create({
    data: {
      name: faker.internet.userName(),
      postalCode: '234-54',
      hostId: user.id,
      frequency: 604800,
      description: 'Dummy description',
      isPublic: true,
      nextDeliveryDate: new Date(),
      producerId: producer.id,
    },
  });
  teamId = team.id;

  await prisma.shipping.create({
    data: {
      userId: user.id,
      buildingNo: '123',
      address: 'dummy address',
      city: 'dummy city',
    },
  });

  // create  order for test
  const order = await prisma.order.create({
    data: {
      teamId,
      minimumTreshold: 50,
    },
  });
  orderId = order.id;

  // create token for test
  jwtToken = authService.generateToken({
    userId,
  });
}, testTime);

afterAll(async () => {
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
  await app.close();
});

describe('InvoiceController (e2e)', () => {
  it(
    'should return invoice details',
    async () => {
      return request(app.getHttpServer())
        .get(`/invoices/${orderId}/${producerId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toBe('application/pdf');
          expect(res.headers['content-disposition']).toContain(
            `filename="purchase-order-${orderId}.pdf"`,
          );
        });
    },
    testTime,
  );
});
