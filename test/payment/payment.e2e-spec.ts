import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { faker } from '@faker-js/faker';
import { Order, Product } from '@prisma/client';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const phone = faker.phone.number();
  const customerId = 'cus_NtREO3efDC5MQv';
  let paymentMethodId: string;
  let userId: string;
  let product: Product;
  let order: Order;
  let itemId: string;
  const testTime = 120000;

  const cardInfo = {
    cardNumber: '4242424242424242',
    expiringMonth: 1,
    expiringYear: 2033,
    cvc: '314',
    phone,
  };

  const chargeInfo = {
    amount: 2000,
    currency: 'gbp',
    customerId: '',
    paymentMethodId: '',
  };

  const defaultCard = {
    lastFourDigits: 2000,
    customerId: '',
    paymentMethodId: '',
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
    const user = await prisma.user.create({
      data: {
        phone,
      },
    });
    userId = user.id;

    // get product for test
    product = await prisma.product.findFirst();

    // get order for test
    order = await prisma.order.findFirst();
  }, testTime);

  afterAll(async () => {
    await app.close();
  });

  describe('PaymentController (e2e)', () => {
    // add payment card to user
    it(
      '/payments/add-card(POST) should add card to user account',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/add-card')
          .send({ ...cardInfo, stripeCustomerId: customerId })
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        paymentMethodId = response.body.data.paymentMethodId;
      },
      testTime,
    );

    // add default card for payments
    it(
      '/payments/default-card(POST) should make card default for payment',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/default-card')
          .send({
            ...defaultCard,
            stripeCustomerId: customerId,
            paymentMethodId,
          })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/payments/default-card(POST) should not make card default if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/default-card')
          .send({ stripeCustomerId: customerId })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // charge user successfully
    it(
      '/payments/charge(POST) should charge a user',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/charge')
          .send({ ...chargeInfo, customerId, paymentMethodId })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/payments/charge(POST) should not charge a user if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/charge')
          .send({ ...chargeInfo })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/payments/charge(POST) should not charge a user if wrong data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/charge')
          .send({
            ...chargeInfo,
            customerId: 'cus_NtREO3efDC5Mv',
            paymentMethodId,
          })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // return users payment options
    it(
      '/payments/options/:id(GET) should return user payment options',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/payments/options/${customerId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // remove payment option from user
    it(
      '/payments/options/:id(PATCH) should remove user payment options',
      async () => {
        const response = await request(app.getHttpServer())
          .patch(`/payments/options/${paymentMethodId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    describe('Basket', () => {
      // add user bulk basket successfully
      it(
        '/payments/basket-bulk(POST) should add a users bulk cart to basket',
        async () => {
          const userBasket = {
            basket: [
              {
                orderId: order.id,
                userId: userId,
                productId: product.id,
                quantity: 2,
                price: 2000,
              },
            ],
          };
          const response = await request(app.getHttpServer())
            .post('/payments/basket-bulk')
            .send(userBasket)
            .expect(201);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
        },
        testTime,
      );

      it(
        '/payments/basket-bulk(POST) should not add item to basket if uncompleted data is supplied',
        async () => {
          const userBasket = {
            basket: [
              {
                userId: userId,
                productId: product.id,
                quantity: 2,
                price: 2000,
              },
            ],
          };
          const response = await request(app.getHttpServer())
            .post('/payments/basket-bulk')
            .send(userBasket)
            .expect(400);
          expect(response.body).toHaveProperty('error');
          expect(typeof response.body.error).toBe('string');
        },
        testTime,
      );

      // add single item to basket
      it(
        '/payments/basket(POST) should add a single item to basket',
        async () => {
          const basket = {
            orderId: order.id,
            userId: userId,
            productId: product.id,
            quantity: 2,
            price: 2000,
          };
          const response = await request(app.getHttpServer())
            .post('/payments/basket')
            .send(basket)
            .expect(201);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
          itemId = response.body.data.id;
        },
        testTime,
      );

      it('/payments/basket(POST) should not add a single item to basket if uncompleted data is supplied', async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/create')
          .send({ orderId: order.id })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      });

      // update item in basket
      it(
        '/payments/basket/:itemId (PATCH) should update item in basket',
        async () => {
          const basket = {
            quantity: 6,
            price: 500,
          };
          const response = await request(app.getHttpServer())
            .patch(`/payments/basket/${itemId}`)
            .send(basket)
            .expect(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
        },
        testTime,
      );

      // delete item from cart
      it(
        '/payments/basket/:id(DELETE) should delete item from cart',
        async () => {
          const response = await request(app.getHttpServer())
            .delete(`/payments/basket/${itemId}`)
            .expect(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
        },
        testTime,
      );
    });
  });
});
