import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { describe } from 'node:test';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const phone = faker.phone.number();
  const businessName = faker.company.catchPhraseNoun();
  const email = faker.internet.email();
  const password = 'password';

  let user: User;
  let userId: string;
  let producerId: string;
  let jwtToken: string;
  let producerCategoryOptionId: string;
  let producerCategoryId: string;

  const producerData = {
    businessName,
    businessAddress: 'Business Address',
    accountsEmail: 'dummyaccounts@mail.com',
    salesEmail: 'dummysales@mail.com',
    minimumTreshold: 200,
    website: 'www.dummy.com',
    description: 'We are professional in backery business',
  };

  const producerInfo = {
    phone,
    email,
    password,
    businessName: faker.company.catchPhraseNoun(),
    businessAddress: 'Business Address',
  };

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

    // get producer category option id to work with
    const result = await prisma.producerCategoryOption.findFirst();
    producerCategoryOptionId = result.id;
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
        producerId = response.body.data.id;
      },
      testTime,
    );

    // update producer record
    it(
      '/users/update/producerId(PATCH) should update a producers record',
      async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/producer/${producerId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(producerData)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/users/update/producerId(PATCH) should not update a producers record if the business name already exist',
      async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/producer/${producerId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(producerData)
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
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

    it(
      '/users/my-teams/:id(GET) should return teams the user is host on',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/my-teams/${userId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/users/requests/:id(GET) should return requests user has made',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/requests/${userId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // add category to producer
    it(
      '/users/producer/category/add(PATCH) should not add producer category if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/users/producer/category/add')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/users/producer/category/add(PATCH) should not add producer category if user is not logged in',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/users/producer/category/add')
          .send({
            content: [
              {
                producerId,
                producerCategoryOptionId,
              },
            ],
          })
          .expect(401);
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      },
      testTime,
    );

    it(
      '/users/producer/category/add(PATCH) should add category to producer',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/users/producer/category/add')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            content: [
              {
                producerId,
                producerCategoryOptionId,
              },
            ],
          })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
  });

  describe('Remove a producer category', () => {
    // remove category from producer
    beforeEach(async () => {
      const result = await prisma.producerCategory.findFirst({
        where: {
          producerId,
        },
      });
      producerCategoryId = result.id;
    });

    it(
      '/users/producer/category/remove(DELETE) should not remove producer category if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .delete('/users/producer/category/remove')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/users/producer/category/remove(DELETE) should not remove producer category if user is not logged in',
      async () => {
        const response = await request(app.getHttpServer())
          .delete('/users/producer/category/remove')
          .send({ producerCategoryId })
          .expect(401);
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      },
      testTime,
    );

    it(
      '/users/producer/category/remove(DELETE) should add category to producer',
      async () => {
        const response = await request(app.getHttpServer())
          .delete('/users/producer/category/remove')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ producerCategoryId })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
  });
});
