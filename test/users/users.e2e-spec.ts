import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const phone = faker.phone.number();
  let user: User;
  let producerId: string;

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
  }, 120000);

  afterAll(async () => {
    await app.close();
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

    // create producer
    it('/users/create-producer should not create new producer if uncompleted data is supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/create-producer')
        .send({ userId: user.id })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/users/create-producer should create new producer', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/create-producer')
        .send({
          userId: user.id,
          businessName: 'Rabble21',
          businessAddress: '22 Kate Road',
        })
        .expect(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
      producerId = response.body.data.id;
    });

    // return all producer
    it('/users/producers should return all producers', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/producers')
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
      producerId = response.body.data.id;
    });

    // return single producer
    it('/users/producer/:id should return all producers', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/producer/${producerId}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });
  });
});
