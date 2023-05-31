import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('UploadController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const phone = faker.phone.number();
  let user: User;
  let userId: string;
  let teamId: string;

  const testTime = 120000;

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
    user = await prisma.user.create({
      data: {
        phone,
      },
    });
    userId = user.id;

    // get buying team for test
    const result = await prisma.buyingTeam.findFirst();
    teamId = result.id;
  }, testTime);

  afterAll(async () => {
    await app.close();
  });

  describe('UploadsController (e2e)', () => {
    it(
      '/uploads/profile-pix/(POST) should upload profile picture',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/uploads/profile-pix/`)
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
