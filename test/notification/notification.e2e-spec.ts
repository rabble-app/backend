import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';
import { notificationType } from '../../src/lib/types';

describe('NotificationController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let userId: string;
  let notificationId: string;
  let jwtToken: string;
  const testTime = 120000;

  const phone = faker.phone.number();
  const notificationData = {
    userId: '',
    text: faker.lorem.paragraph(),
    type: notificationType.TEAM,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
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

    // create dummy token
    jwtToken = authService.generateToken({ userId });
  }, testTime);

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    await app.close();
  });

  describe('NotificationController (e2e)', () => {
    it(
      '/notifications/(POST) should add notification',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/notifications/')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ ...notificationData, userId })
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        notificationId = response.body.data.id;
      },
      testTime,
    );

    it(
      '/notifications/(POST) should not add notification if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/notifications/')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ ...notificationData })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/notifications/(PATCH) should update notification',
      async () => {
        const response = await request(app.getHttpServer())
          .patch(`/notifications`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ userId })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/notifications should not update notification if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .patch(`/notifications`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ ...notificationData })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/notifications/:userId(GET) should return user notifications',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/notifications/${userId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // delete notification
    it(
      '/notifications/:id(DELETE) should delete notification',
      async () => {
        const response = await request(app.getHttpServer())
          .delete(`/notifications/${notificationId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
  });
});
