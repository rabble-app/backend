import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const phone = '+2347037381011';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    await app.listen(process.env.PORT);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AppController (e2e)', () => {
    // Send OTP
    it('/auth/send-otp (POST) should not send the user OTP if phone number is not supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/send-otp')
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/auth/send-otp (POST) should send the user OTP', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ phone })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // verify OTP
    it('/auth/verify-otp (POST) should not verify otp if incomplete data is supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({ phone })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/auth/verify-otp (POST) should not verify otp if wrong data is supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({ phone, code: '22334', sid: 'rtreyt' })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });
  });
});
