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
  let customerId = 'cus_OFCaSUidAGIJOA';
  const paymentIntentId = '';
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
  };

  const chargeInfo = {
    amount: 2000,
    currency: 'gbp',
    customerId: '',
    paymentMethodId: '',
    userId: '',
  };

  const defaultCard = {
    lastFourDigits: '4343',
    paymentMethodId: '',
    userId: '',
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

    // stripe customer id for test
    const result = await prisma.user.findFirst({
      where: {
        stripeCustomerId: {
          not: 'NULL',
        },
      },
      select: {
        stripeCustomerId: true,
      },
    });
    if (result) {
      customerId = result.stripeCustomerId;
    }
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
            userId,
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
          .send({ ...chargeInfo, customerId, paymentMethodId, userId })
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

    // create payment intent
    it(
      '/payments/intent(POST) should create payment intent',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/intent')
          .send({ ...chargeInfo, customerId })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/payments/charge(POST) should not create payment intent if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/intent')
          .send({ ...chargeInfo })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // retrieve payment intent
    it(
      '/payments/retrieve-intent(POST) should return payment intent',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/retrieve-intent')
          .send({ paymentIntentId })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/payments/retrieve-intent(POST) should not return payment intent if incomplete data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/retrieve-intent')
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
          .post('/payments/basket')
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

      // bulk update of basket
      it(
        '/payments/basket-bulk/ (PATCH) should update basket in bulk',
        async () => {
          const basket = [
            {
              basketId: itemId,
              quantity: 6,
              price: 500,
            },
          ];
          const response = await request(app.getHttpServer())
            .patch(`/payments/basket-bulk/`)
            .send(basket)
            .expect(200);
          expect(response.body.error).toBeUndefined();
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
