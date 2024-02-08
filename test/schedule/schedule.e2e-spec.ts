import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
jest.useFakeTimers();

describe('ScheduleController (e2e)', () => {
  let app: INestApplication;
  const testTime = 140000;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    await app.listen(process.env.PORT);
  }, testTime);

  // afterAll(async () => {
  //   await app.close();
  // }, testTime);

  describe('ScheduleController (e2e)', () => {
    it(
      '/schedule/cancel-orders(GET) should cancel orders if deadline has reached and threshold was not reached',
      async () => {
        await request(app.getHttpServer())
          .get('/schedule/cancel-orders')
          .expect(200);
      },
      testTime,
    );

    it(
      '/schedule/charge-users(GET) should charge users if group treshold has been reached',
      async () => {
        await request(app.getHttpServer())
          .get('/schedule/charge-users')
          .expect(200);
      },
      testTime,
    );

    it(
      '/schedule/complete-orders(GET) should complete orders',
      async () => {
        await request(app.getHttpServer())
          .get('/schedule/complete-orders')
          .expect(200);
      },
      testTime,
    );

    it(
      '/schedule/create-orders(GET) should create orders if interval has passed',
      async () => {
        await request(app.getHttpServer())
          .get('/schedule/create-orders')
          .expect(200);
      },
      testTime,
    );

    it(
      '/schedule/authorize-payment(GET) should authorize payment for new orders',
      async () => {
        await request(app.getHttpServer())
          .get('/schedule/authorize-payment')
          .expect(200);
      },
      testTime,
    );

    it(
      '/schedule/set-delivery(GET) should set date for delivery',
      async () => {
        await request(app.getHttpServer())
          .get('/schedule/set-delivery')
          .expect(200);
      },
      testTime,
    );

    it(
      '/schedule/change-stripe-token(GET) should get payment method id from user with stripe apple token',
      async () => {
        await request(app.getHttpServer())
          .get('/schedule/change-stripe-token')
          .expect(200);
      },
      testTime,
    );
  });
});
