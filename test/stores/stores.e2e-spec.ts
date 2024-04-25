import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { Order, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';
import { truncateDB } from '../truncate-db';
describe('StoreController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const phone = faker.phone.number();
  let user: User;
  let userId: string;
  const testTime = 120000;
  let jwtToken: string;
  let storeId: string;
  let order: Order;

  const store = {
    name: faker.internet.userName(),
    postalCode: faker.lorem.paragraph(),
    city: 'London',
    streetAddress: '32 Brooke Street',
    direction: 'Take cab from nelson to brooke street',
    storeType: 'Random',
    shelfSpace: 'Dummy',
    dryStorageSpace: 'Dummy',
  };

  const openHours = {
    storeId: '',
    type: 'MON_TO_FRI',
    customOpenHours: [
      {
        day: 'MONDAY',
        startTime: '08:00am',
        endTime: '10:00pm',
      },
    ],
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
    user = await prisma.user.create({
      data: {
        phone,
      },
    });
    userId = user.id;
    const producer = await prisma.producer.create({
      data: {
        userId,
        businessName: faker.internet.userName(),
      },
    });

    // create  team for test
    const team = await prisma.buyingTeam.create({
      data: {
        name: faker.internet.userName(),
        postalCode: '234-54',
        hostId: user.id,
        frequency: 604800,
        description: 'Dummy description',
        isPublic: true,
        nextDeliveryDate: new Date(),
        producerId: producer.id,
      },
    });

    const categoryOption = await prisma.producerCategoryOption.create({
      data: {
        name: faker.lorem.word({ length: 10 }),
      },
    });
    await prisma.producerCategory.create({
      data: {
        producerId: producer.id,
        producerCategoryOptionId: categoryOption.id,
      },
    });

    // await prisma.shipping.create({
    //   data: {
    //     userId: user.id,
    //     buildingNo: '123',
    //     address: 'dummy address',
    //     city: 'dummy city',
    //   },
    // });

    // create  order for test
    order = await prisma.order.create({
      data: {
        teamId: team.id,
        minimumTreshold: 50,
        deliveryDate: new Date(),
      },
    });
    const productCategory = await prisma.productCategory.create({
      data: {
        name: faker.lorem.word({ length: 15 }),
      },
    });
    const product = await prisma.product.create({
      data: {
        producerId: producer.id,
        name: 'dummy product',
        price: 100,
        categoryId: productCategory.id,
      },
    });

    await prisma.basket.create({
      data: {
        orderId: order.id,
        price: 100,
        quantity: 2,
        userId,
        productId: product.id,
      },
    });

    // create dummy token
    jwtToken = authService.generateToken({ userId });
  }, testTime);

  afterAll(async () => {
    await truncateDB(prisma);
    await app.close();
  });

  describe('StoreController (e2e)', () => {
    // partner store creation
    it(
      '/store/create(POST) should not create a new store if incomplete data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/store/create')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            direction: 'From district 1 enter ride to Washinton',
            storeType: '4Square',
          })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );
    it(
      '/store/create(POST) should create a new store if all required data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/store/create')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(store)
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        storeId = response.body.data.id;
      },
      testTime,
    );
    it(
      '/store/create(POST) should not create a new store if the suplied name already exist',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/store/create')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(store)
          .expect(409);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // store open hours
    it(
      '/store/open-hours(PATCH) should not add store open hours if incomplete data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/store/open-hours')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            customOpenHours: [],
          })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/store/open-hours(PATCH) should add store open hours if all required data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/store/open-hours')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ ...openHours, storeId })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // update store info
    it(
      '/store/(PATCH) should update store information successfully',
      async () => {
        const response = await request(app.getHttpServer())
          .patch(`/store/${storeId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ city: 'London' })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
    it(
      '/store/(Get) should get store inbound deliveries for today successfully',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/store/${storeId}/deliveries?period=today`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ city: 'London' })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(response.body.data).toHaveLength(1);
      },
      testTime,
    );
    it(
      '/store/(Get) should get past store inbound deliveries successfully',
      async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        await prisma.order.update({
          where: { id: order.id },
          data: { deliveryDate: pastDate },
        });
        const response = await request(app.getHttpServer())
          .get(`/store/${storeId}/deliveries?period=past`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(response.body.data).toHaveLength(1);
      },
      testTime,
    );
    it(
      '/store/(Get) should get upcoming store inbound deliveries successfully',
      async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        await prisma.order.update({
          where: { id: order.id },
          data: { deliveryDate: futureDate },
        });
        const response = await request(app.getHttpServer())
          .get(`/store/${storeId}/deliveries?period=upcoming&search=dummy`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(response.body.data).toHaveLength(1);
      },
      testTime,
    );
  });
});
