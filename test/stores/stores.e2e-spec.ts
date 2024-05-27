import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { Collection, Order, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';
import { UploadsService } from '../../src/uploads/uploads.service';
import { UploadsService as MockedUploadsService } from '../../__mocks__/uploads.service';
describe('StoreController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const phone = faker.phone.number();
  let user: User;
  let userId: string;
  let jwtToken: string;
  let storeId: string;
  let order: Order;
  let productCategoryId: string;
  let productId: string;
  let orderCollection: Collection;

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
    })
      .overrideProvider(UploadsService)
      .useValue(MockedUploadsService)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
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
        name: faker.company.catchPhraseNoun() + Math.floor(Math.random() * 30),
      },
    });
    await prisma.producerCategory.create({
      data: {
        producerId: producer.id,
        producerCategoryOptionId: categoryOption.id,
      },
    });

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
    productCategoryId = productCategory.id;
    const product = await prisma.product.create({
      data: {
        producerId: producer.id,
        name: 'dummy product',
        price: 100,
        categoryId: productCategory.id,
      },
    });
    productId = product.id;

    await prisma.basket.create({
      data: {
        orderId: order.id,
        price: 100,
        quantity: 2,
        userId,
        productId: product.id,
      },
    });

    // create order collection for test
    orderCollection = await prisma.collection.create({
      data: {
        orderId: order.id,
        userId: userId,
        dateOfCollection: new Date(),
      },
    });

    // create dummy token
    jwtToken = authService.generateToken({ userId });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await prisma.productCategory.delete({ where: { id: productCategoryId } });
    await app.close();
  });

  describe('StoreController (e2e)', () => {
    // partner store creation
    it('/store/create(POST) should not create a new store if incomplete data is supplied', async () => {
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
    });
    it('/store/create(POST) should create a new store if all required data is supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/store/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(store)
        .expect(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
      storeId = response.body.data.id;
    });
    it('/store/create(POST) should not create a new store if the suplied name already exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/store/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(store)
        .expect(409);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    // store open hours
    it('/store/open-hours(PATCH) should not add store open hours if incomplete data is supplied', async () => {
      const response = await request(app.getHttpServer())
        .patch('/store/open-hours')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          customOpenHours: [],
        })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/store/open-hours(PATCH) should add store open hours if all required data is supplied', async () => {
      const response = await request(app.getHttpServer())
        .patch('/store/open-hours')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ ...openHours, storeId })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // update store info
    it('/store/(PATCH) should update store information successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/store/${storeId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ city: 'London' })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    //inbound delivery
    it('/store/(Get) should fail to get inbound deliveries if storeId is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/store/invalid-store-id/deliveries?period=today')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
      expect(response.body.message).toBe('Invalid store id');
    });
    it('/store/(Get) should get store inbound deliveries for today successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/store/${storeId}/deliveries?period=today`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(1);
    });
    it('/store/(Get) should get past store inbound deliveries successfully', async () => {
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
    });
    it('/store/(Get) should get upcoming store inbound deliveries successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      await prisma.order.update({
        where: { id: order.id },
        data: { deliveryDate: futureDate },
      });
      const response = await request(app.getHttpServer())
        .get(`/store/${storeId}/deliveries?period=upcoming`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(1);
    });
    it('/store/(Get) should search for upcoming store inbound deliveries successfully by team name', async () => {
      await prisma.buyingTeam.update({
        where: { id: order.teamId },
        data: { name: 'searchable team name' },
      });
      const response = await request(app.getHttpServer())
        .get(`/store/${storeId}/deliveries?period=upcoming&search=team`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(1);
    });
    it('/store/(Get) should search for upcoming store inbound deliveries successfully by producer name', async () => {
      await prisma.producer.update({
        where: { userId },
        data: { businessName: 'searchable producer name' },
      });
      const response = await request(app.getHttpServer())
        .get(`/store/${storeId}/deliveries?period=upcoming&search=producer`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(1);
    });
    it('/store/(Get) should fail to search for upcoming store inbound deliveries by producer name if name does not match', async () => {
      const response = await request(app.getHttpServer())
        .get(`/store/${storeId}/deliveries?period=upcoming&search=goal`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(0);
    });
    it('should confirm order products received', async () => {
      const confirmOrderDto = {
        orderId: order.id,
        products: [
          {
            productId,
            quantity: 2,
          },
        ],
      };
      const response = await request(app.getHttpServer())
        .post(`/store/${storeId}/confirm-order-receipt`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('orderId', order.id)
        .field('products', JSON.stringify(confirmOrderDto.products))
        .attach('file', './test/testImage.jpg');
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
    });

    it('should fail to confirm order products received if quantity does not match and there is not note attached', async () => {
      const confirmOrderDto = {
        orderId: order.id,
        products: [
          {
            productId,
            quantity: 1,
          },
        ],
      };
      const response = await request(app.getHttpServer())
        .post(`/store/${storeId}/confirm-order-receipt`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('orderId', order.id)
        .field('products', JSON.stringify(confirmOrderDto.products))
        .attach('file', './test/testImage.jpg');
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'One of the order products has insufficient quantity, please add a note',
      );
    });
    it('should update the order status as PARTIAL if product quantity is less than expected', async () => {
      const confirmOrderDto = {
        orderId: order.id,
        products: [
          {
            productId,
            quantity: 1,
          },
        ],
      };
      const response = await request(app.getHttpServer())
        .post(`/store/${storeId}/confirm-order-receipt`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .set('Content-Type', 'multipart/form-data')
        .field('orderId', order.id)
        .field('note', 'test note')
        .field('products', JSON.stringify(confirmOrderDto.products))
        .attach('file', './test/testImage.jpg');
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('PARTIAL');
    });
    //customer collections
    it('/store/:store-id/collections(Get) should fail to get collection infor if storeId is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/store/invalid-store-id/collections?period=today')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
      expect(response.body.message).toBe('Invalid store id');
    });
    it('/store/:store-id/collections(Get) should get store item collections for today successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/store/${storeId}/collections?period=today`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(1);
    });
    it('/store/:store-id/collections(Get) should get past store item collections successfully', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      await prisma.collection.update({
        where: { id: orderCollection.id },
        data: { dateOfCollection: pastDate },
      });
      const response = await request(app.getHttpServer())
        .get(`/store/${storeId}/collections?period=past`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(1);
    });
    it('/store/:store-id/collections(Get) should get upcoming store item collection successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      await prisma.collection.update({
        where: { id: orderCollection.id },
        data: { dateOfCollection: futureDate },
      });
      const response = await request(app.getHttpServer())
        .get(`/store/${storeId}/collections?period=upcoming`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(1);
    });
    it('/store/:store-id/collections(Get) should search for store upcoming item collections successfully by user name', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { firstName: 'searchable first name' },
      });
      const response = await request(app.getHttpServer())
        .get(`/store/${storeId}/collections?period=upcoming&search=first name`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(1);
    });
    it('/store/:store-id/collections(Get) should fail to search for upcoming store item collections by user name if name does not match', async () => {
      const response = await request(app.getHttpServer())
        .get(`/store/${storeId}/collections?period=upcoming&search=goal`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(response.body.data).toHaveLength(0);
    });
  });
});
