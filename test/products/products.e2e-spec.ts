import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { Producer, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const phone = faker.phone.number();
  let user: User;
  let producer: Producer;
  let productId: string;
  let producerId: string;
  let userId: string;
  const testTime = 120000;
  let jwtToken: string;

  const product = {
    name: faker.internet.userName(),
    description: faker.lorem.paragraph(),
    price: 200,
    producerId: null,
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

    // create dummy producer for test
    producer = await prisma.producer.create({
      data: {
        userId: user.id,
        businessAddress: faker.address.city(),
        businessName: faker.internet.userName(),
      },
    });
    product.producerId = producer.id;
    producerId = producer.id;

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

  describe('ProductsController (e2e)', () => {
    // create product
    it(
      '/products/create(POST) should create a new product',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/products/create')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(product)
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        productId = response.body.data.id;
      },
      testTime,
    );

    it(
      '/products/create(POST) should not create product if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/products/create')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ name: 'product name' })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // return a single product
    it(
      '/products/:id(GET) should return a single product information',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/${productId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return products of a producer
    it(
      '/products/producer/:id(GET) should return products of a producer',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/producer/${producerId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // store recently viewed products
    it(
      '/products/recently-viewed(POST) should store recently viewed product',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/products/recently-viewed')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ productId, userId })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/products/recently-viewed(POST) should not store recently viewed product if incomplete data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/products/recently-viewed')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ productId })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/products/recently-viewed/:id(GET) should return recently viewed products',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/recently-viewed/${userId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // users also bought
    it(
      '/products/also-bought/:producerId(GET) should return products users also bought',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/also-bought/${producerId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return producers product normal
    it(
      '/products/normal/:producerId(GET) should return products of a producer',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/normal/${producerId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return products for admin panel
    it(
      '/products/admin/section(GET) should return products of a producer',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/admin/section?offset=0&approved=true`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // search feature
    it(
      '/products/admin/search/:keyword(GET) should return 200 on a successful search',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/products/admin/search/teamone')
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
