import Stripe from 'stripe';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const phone = faker.phone.number('501-###-###');
  let customerId: string;
  let paymentIntentId: string;
  let paymentMethodId: string;
  let userId: string;
  let producerId: string;
  let productId: string;
  let productId2: string;
  let orderId: string;
  let teamId: string;
  let itemId: string;
  let jwtToken: string;
  let stripe: Stripe;
  const testTime = 120000;

  const chargeInfo = {
    amount: 2000,
    currency: 'gbp',
    customerId: '',
    paymentMethodId: '',
    userId: '',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
    app.useGlobalPipes(new ValidationPipe());
    const params = app.get('AWS_PARAMETERS');
    await app.init();
    await app.listen(process.env.PORT);

    stripe = new Stripe(params.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
    // create dummy stripe user for test
    const stripeUser = await stripe.customers.create({
      phone,
    });
    customerId = stripeUser.id;

    // create dummy user for test
    const user = await prisma.user.create({
      data: {
        phone,
        stripeCustomerId: customerId,
      },
    });
    userId = user.id;

    // create dummy producer for test
    const producer = await prisma.producer.create({
      data: {
        userId,
        businessName: faker.internet.userName(),
      },
    });
    producerId = producer.id;

    // create payment method for the test
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 8,
        exp_year: 2026,
        cvc: '314',
      },
    });
    paymentMethodId = paymentMethod.id;

    // create product for test
    const product = await prisma.product.create({
      data: {
        producerId,
        name: faker.internet.userName(),

        price: 200,
      },
    });
    productId = product.id;

    // create product2 for test
    const product2 = await prisma.product.create({
      data: {
        producerId,
        name: faker.internet.userName(),

        price: 200,
      },
    });
    productId2 = product2.id;

    // create  team for test
    const team = await prisma.buyingTeam.create({
      data: {
        producerId,
        hostId: userId,
        name: faker.internet.userName(),
        postalCode: '12345',
      },
    });
    teamId = team.id;

    // create  order for test
    const order = await prisma.order.create({
      data: {
        teamId,
        minimumTreshold: 50,
      },
    });
    orderId = order.id;

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

  describe('PaymentController (e2e)', () => {
    // add payment card to user
    it(
      '/payments/add-card(POST) should add card to user account',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/add-card')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ paymentMethodId, stripeCustomerId: customerId })
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // add default card for payments
    it(
      '/payments/default-card(POST) should make card default for payment',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/default-card')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            paymentMethodId,
            lastFourDigits: '2332',
            stripeCustomerId: customerId,
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ ...chargeInfo, customerId })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        paymentIntentId = response.body.data.paymentIntentId;
      },
      testTime,
    );

    it(
      '/payments/charge(POST) should not create payment intent if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/intent')
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
                orderId,
                userId,
                productId,
                quantity: 2,
                price: 2000,
              },
            ],
            teamId,
            deadlineReached: false,
          };
          const response = await request(app.getHttpServer())
            .post('/payments/basket-bulk')
            .set('Authorization', `Bearer ${jwtToken}`)
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
                productId,
                userId: userId,
                quantity: 2,
                price: 2000,
              },
            ],
          };
          const response = await request(app.getHttpServer())
            .post('/payments/basket-bulk')
            .set('Authorization', `Bearer ${jwtToken}`)
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
            orderId,
            userId,
            productId: productId2,
            quantity: 2,
            price: 2000,
            teamId,
            deadlineReached: false,
          };
          const response = await request(app.getHttpServer())
            .post('/payments/basket')
            .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ orderId })
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
            .set('Authorization', `Bearer ${jwtToken}`)
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
              type: 'SINGLE',
            },
          ];
          const response = await request(app.getHttpServer())
            .patch(`/payments/basket-bulk/`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
              basket,
              orderId,
              deadlineReached: true,
            })
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
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
        },
        testTime,
      );
    });

    // remove payment card from user
    it(
      '/payments/remove-card(DELETE) should remove card from user',
      async () => {
        const response = await request(app.getHttpServer())
          .delete('/payments/remove-card')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ paymentMethodId })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
  });
});
