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
  let userId: string;
  let producerId: string;

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
  }, testTime);

  afterAll(async () => {
    await app.close();
  });

  describe('UsersController (e2e)', () => {
    // update user record
    it(
      '/users/update(PATCH) should update a users record',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/users/update')
          .send({ phone, postalCode: '1234' })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // create producer
    it(
      '/users/create-producer(POST) should not create new producer if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/users/create-producer')
          .send({ userId })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/users/create-producer(POST) should create new producer',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/users/create-producer')
          .send({
            userId,
            businessName: 'Rabble21',
            businessAddress: '22 Kate Road',
            minimumTreshold: 4,
          })
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        producerId = response.body.data.id;
      },
      testTime,
    );

    // return all producer
    it(
      '/users/producers(GET) should return all producers',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/users/producers')
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        producerId = response.body.data.id;
      },
      testTime,
    );

    // return single producer
    it(
      '/users/producer/:id(GET) should return all producers',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/producer/${producerId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // create delivery address
    it(
      '/users/delivery-address(POST) should not add user delivery address if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/users/delivery-address')
          .send({ userId })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/users/delivery-address should add user delivery address',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/users/delivery-address')
          .send({
            userId,
            buildingNo: 'Rabble21',
            address: '22 Kate Road',
            city: 'Dummy City',
          })
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/users/delivery-address/:userId should return user delivery address',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/delivery-address/${userId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/users/delivery-address/:userId should update user delivery address',
      async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/delivery-address/${userId}`)
          .send({
            userId,
            buildingNo: 'Rabble21',
            city: 'Dummy City',
          })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/users/order-history/:id(GET) should return user order history',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/order-history/${userId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/users/subscription/:id(GET) should return user subscriptions',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/subscription/${userId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );  
  });
});
