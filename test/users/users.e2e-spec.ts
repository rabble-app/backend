import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/auth/auth.service';
import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const phone = faker.phone.number();
  const phone2 = faker.phone.number() + '34';
  const businessName =
    faker.company.catchPhraseNoun() + Math.floor(Math.random() * 30);
  const email = Math.floor(Math.random() * 30) + faker.internet.email();
  const password = 'password';

  let user: User;
  let userId: string;
  let producerId: string;
  let jwtToken: string;
  let producerCategoryOptionId: string;
  let producerCategoryId: string;
  let teamId: string;
  let producerToken: string;

  const producerInfoUpdate = {
    businessAddress: 'Business Address',
    accountsEmail: 'dummyaccounts@mail.com',
    salesEmail: 'dummysales@mail.com',
    minimumTreshold: 200,
    description: 'We are professional in backery business',
  };

  const producerInfo = {
    email,
    password,
    businessName,
    businessAddress: 'Business Address',
    phone: phone2,
  };

  const deliveryAddressInfo = {
    location: faker.company.catchPhraseNoun(),
    type: 'WEEKLY',
    cutOffTime: '09;00',
    customAreas: [
      {
        day: 'MONDAY',
        cutOffTime: '09:00',
      },
      {
        day: 'FRIDAY',
        cutOffTime: '09:00',
      },
    ],
  };

  const testTime = 120000;

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
    user = await prisma.user.create({
      data: {
        phone,
      },
    });
    userId = user.id;

    // get producer category option id to work with
    const result = await prisma.producerCategoryOption.create({
      data: {
        name: faker.company.catchPhraseNoun() + Math.floor(Math.random() * 30),
      },
    });
    producerCategoryOptionId = result.id;

    // create dummy producer for test
    const producer = await prisma.producer.create({
      data: {
        userId,
        businessName:
          faker.internet.userName() + Math.floor(Math.random() * 30),
      },
    });

    // create  team for test
    const team = await prisma.buyingTeam.create({
      data: {
        producerId: producer.id,
        hostId: userId,
        name: faker.internet.userName() + Math.floor(Math.random() * 30),
        postalCode: '12345',
      },
    });
    teamId = team.id;

    // create  order for test
    await prisma.order.create({
      data: {
        teamId,
        minimumTreshold: 50,
      },
    });

    // create producer token
    producerToken = authService.generateToken({
      userId,
      producerId: producer.id,
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

  describe('UsersController (e2e)', () => {
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

    // update user record
    it(
      '/users/update(PATCH) should update a users record',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/users/update')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ phone, postalCode: '1234' })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
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
          .send({ ...producerInfoUpdate })
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
          .send({
            ...producerInfoUpdate,
            businessName,
          })
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
      producerCategoryId = result?.id;
    });

    it(
      '/users/producer/category/remove(DELETE) should not remove producer category if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .delete('/users/producer/category/remove')
          .set('Authorization', `Bearer ${jwtToken}`)
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

  // search feature
  it(
    '/users/search/:keyword/:category(GET) should return search result',
    async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/search/mykeyword/TEAM`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    },
    testTime,
  );

  it(
    '/users/search/:keyword/:category(GET) should not return search result if user is not logged in',
    async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search/:keyword/:category')
        .expect(401);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    },
    testTime,
  );

  it(
    '/users/search/:keyword/:category(GET) should not handle search if wrong category is supplied',
    async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/search/mykeyword/TEAMSS`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    },
    testTime,
  );

  it(
    '/users/search/:keyword/:category(GET) should not handle search if keyword length is less than 3',
    async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/search/my/TEAM`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    },
    testTime,
  );

  // popular searches
  it(
    '/users/popular-searches(GET) should return popular searches',
    async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/popular-searches`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    },
    testTime,
  );

  // delivery area
  it(
    '/users/producer/delivery-area(POST) should add delivery area',
    async () => {
      const response = await request(app.getHttpServer())
        .post('/users/producer/delivery-area')
        .set('Authorization', `Bearer ${producerToken}`)
        .send({
          ...deliveryAddressInfo,
        })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    },
    testTime,
  );

  // return users basket
  it(
    '/users/basket/(GET) should return users basket',
    async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/basket/`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ teamId }) //Todo: get buying team id
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    },
    testTime,
  );

  // return producer categories
  it(
    '/users/producer/categories(GET) should return producers categories',
    async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/producer/categories`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    },
    testTime,
  );

  // return producer recent orders
  it(
    '/users/producer/orders/recent(GET) should return producers recent orders',
    async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/producer/orders/recent`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    },
    testTime,
  );
});
