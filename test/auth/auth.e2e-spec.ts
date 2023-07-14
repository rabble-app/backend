import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { faker } from '@faker-js/faker';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;
  const testTime = 120000;

  const phone = faker.phone.number();
  const email = faker.internet.email();
  const password = 'password';

  const producerInfo = {
    phone,
    email,
    password,
    businessName: faker.company.catchPhraseNoun(),
    businessAddress: 'Business Address',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    await app.listen(process.env.PORT);

    // create dummy user for test
    const user = await prisma.user.create({
      data: {
        phone,
      },
    });
    userId = user.id;
  }, testTime);

  afterAll(async () => {
    await app.close();
  });

  describe('AppController (e2e)', () => {
    // Send OTP
    it(
      '/auth/send-otp (POST) should not send the user OTP if phone number is not supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/send-otp')
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/auth/send-otp (POST) should send the user OTP',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/send-otp')
          .send({ phone })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // verify OTP
    it(
      '/auth/verify-otp (POST) should not verify otp if incomplete data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/verify-otp')
          .send({ phone })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/auth/verify-otp (POST) should not verify otp if wrong data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/verify-otp')
          .send({ phone, code: '22334', sid: 'rtreyt' })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/auth/quit/:id (DELETE) should quit rabble',
      async () => {
        const response = await request(app.getHttpServer())
          .delete(`/auth/quit/${userId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // register producer
    it(
      '/auth/register (POST) should register a producer',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(producerInfo)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/auth/register (POST) should not register a producer if incomplete data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({ phone })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // login producer
    it(
      '/auth/login (POST) should register a producer',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email, password })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/auth/login (POST) should not register a producer if incomplete data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );
  });
});
