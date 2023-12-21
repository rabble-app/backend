import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';

describe('UploadController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const phone = faker.phone.number() + Math.floor(Math.random() * 10);
  let user: User;
  let userId: string;
  let teamId: string;
  let producerId: string;
  let jwtToken: string;

  const testTime = 120000;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = app.get<AuthService>(AuthService);
    prisma = app.get<PrismaService>(PrismaService);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    await app.listen(process.env.PORT);

    // create dummy user for test
    user = await prisma.user.create({
      data: {
        phone,
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
        producerId,
        hostId: userId,
        name: faker.internet.userName(),
        postalCode: '12345',
      },
    });
    teamId = team.id;

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

  describe('UploadsController (e2e)', () => {
    it(
      '/uploads/profile-pix/(POST) should upload profile picture',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/uploads/profile-pix/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .field('userId', userId)
          .set('Content-Type', 'multipart/form-data')
          .attach('file', './test/testImage.jpg')
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/uploads/profile-pix/(POST) should not upload profile picture if required data is not supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/uploads/profile-pix/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .set('Content-Type', 'multipart/form-data')
          .attach('file', './test/testImage.jpg')
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/uploads/team-pix/(POST) should upload team profile picture',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/uploads/team-pix/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .field('teamId', teamId)
          .set('Content-Type', 'multipart/form-data')
          .attach('file', './test/testImage.jpg')
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/uploads/team-pix/(POST) should not upload team profile picture if required data is not supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/uploads/team-pix/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .set('Content-Type', 'multipart/form-data')
          .attach('file', './test/testImage.jpg')
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );
  });
});
