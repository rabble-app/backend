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
  let jwtToken: string;
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

  const incompleteChangePasswordData = {
    oldPassword: '123456789',
    newPassword: 'linkdedinuser',
  };

  const changePasswordData = {
    oldPassword: password,
    newPassword: 'linkdedinuser',
    channel: 'PASSWORD_RESET',
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
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        jwtToken = response.body.data.token;
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
      '/auth/login (POST) should login a producer',
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
      '/auth/login (POST) should not login a producer if incomplete data is supplied',
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

    // Email Verification
    it('/auth/email-verification (POST) should not verify email if email verification token is invalid/expired', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/email-verification')
        .send({ token: 'invalidToken' })
        .expect(401);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/auth/email-verification (POST) should verify email if email verification token is valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/email-verification')
        .send({ token: jwtToken })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // Resend Email Verification
    it('/auth/resend-email-verification (POST) should not resend email verification if user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/resend-email-verification')
        .send({ email: 'ok54nb32@gmail.com' })
        .expect(404);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/auth/resend-email-verification (POST) should not resend email verification if email is not supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/resend-email-verification')
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');

      return response;
    });

    it('/auth/resend-email-verification (POST) should resend email verification if email is valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/resend-email-verification')
        .send({ email })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // Password Reset
    it('/auth/send-reset-password-link (POST) should not send password reset link if user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/send-reset-password-link')
        .send({ email: 'ok54nb32@gmail.com' })
        .expect(404);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/auth/send-reset-password-link (POST) should not send password reset link if email is not supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/send-reset-password-link')
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/auth/send-reset-password-link (POST) should send password reset link if email is valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/send-reset-password-link')
        .send({ email })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // Change Password
    it('/auth/change-password (POST) should not change password if no token is supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .send(changePasswordData)
        .expect(401);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/auth/change-password (POST) should not change password if invalid/expired token is supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${jwtToken}invalid`)
        .send(changePasswordData)
        .expect(401);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/auth/change-password (POST) should not change password if incomplete data is supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(incompleteChangePasswordData)
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');

      return response;
    });

    // pusher user auth
    it('/auth/pusher-user (POST) pusher user authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/pusher-user')
        .set('Authorization', `Bearer ${jwtToken}invalid`)
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    // pusher channel authorization
    it('/auth/pusher-channel (POST) pusher channel authorization', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/pusher-channel')
        .set('Authorization', `Bearer ${jwtToken}invalid`)
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });
  });
});
