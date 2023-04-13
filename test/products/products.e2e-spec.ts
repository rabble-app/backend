import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { Producer, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const phone = faker.phone.number();
  let user: User;
  let producer: Producer;
  let productId: string;
  let producerId: string;

  const product = {
    name: faker.internet.userName(),
    description: faker.lorem.paragraph(),
    price: '200',
    producerId: null,
  };

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
  }, 120000);

  afterAll(async () => {
    await app.close();
  });

  describe('ProductsController (e2e)', () => {
    // create product
    it('/products/create(POST) should create a new product', async () => {
      const response = await request(app.getHttpServer())
        .post('/products/create')
        .send(product)
        .expect(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
      productId = response.body.data.id;
    });

    it('/products/create(POST) should not create product if uncompleted data is supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/products/create')
        .send({ name: 'product name' })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    // return a single product
    it('/products/:id(GET) should return a single product information', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // return products of a producer
    it('/products/producer/:id(GET) should return products of a producer', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/producer/${producerId}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // search products
    it('/products/search/:keyword(GET) should return products', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/search/product1`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });
  });
});