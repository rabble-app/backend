import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const phone = '+2347037381012';

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
    await prisma.user.create({
      data: {
        phone,
      },
    });
  }, 120000);

  afterAll(async () => {
    await app.close();
    await prisma.user.delete({
      where: {
        phone,
      },
    });
  });

  describe('UsersController (e2e)', () => {
    // update user record
    it('/users/update(PATCH) should update a users record', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/update')
        .send({ phone, postalCode: '1234' })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });
  });
});
