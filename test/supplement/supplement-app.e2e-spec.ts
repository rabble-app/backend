import Stripe from 'stripe';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';
import { describe } from 'node:test';
import { SupplementTeamStatus } from '@prisma/client';
import { PaymentStatus, PaymentType } from '@prisma/client';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const phone = faker.phone.number('501-###-###');
  let stripeCustomerId: string;
  let paymentMethodId = 'pm_card_mastercard';
  let paymentIntentId: string;
  let paymentIntentIdForTopUp: string;
  let userId: string;
  let producerId: string;
  let productId: string;
  let product2Id: string;
  let teamId: string;
  let team2Id: string;
  let stripe: Stripe;
  let jwtToken: string;
  const testTime = 120000;


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

    stripe = new Stripe(params.SUPPLEMENT_STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });

    // create dummy stripe user for test
    const stripeUser = await stripe.customers.create({
      phone,
    });
    stripeCustomerId = stripeUser.id;

    // create dummy supplement user for test
    const user = await prisma.user.create({
      data: {
        phone: `${phone}3`,
        stripeCustomerId,
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

    // create products for test
    const product = await prisma.product.create({
      data: {
        producerId,
        name: faker.internet.userName(),
        leadTime: 2,
        price: 200,
      },
    });
    productId = product.id;

    const product2 = await prisma.product.create({
      data: {
        producerId,
        name: `${faker.internet.userName()}2`,
        leadTime: 2,
        price: 200,
      },
    });
    product2Id = product2.id;

    // create  team for test
    const team = await prisma.buyingTeam.create({
      data: {
        producerId,
        hostId: userId,
        name: faker.internet.userName(),
        postalCode: '12345',
        supplementTeamProducts:{
          create:{
            productId,
            status: SupplementTeamStatus.ACTIVE,
          }
        }
      },
    });
    teamId = team.id;

    const team2 = await prisma.buyingTeam.create({
      data: {
        producerId,
        hostId: userId,
        name: `${faker.internet.userName()}2`,
        postalCode: '12345',
        supplementTeamProducts:{
          create:{
            productId: product2Id,
            status: SupplementTeamStatus.PREORDER,
          }
        }
      },
    });
    team2Id = team2.id;


    // create  order for test
    await prisma.order.create({
      data: {
        teamId,
        minimumTreshold: 50,
      },
    });

    // create dummy token
    jwtToken = authService.generateToken({ userId });
  }, testTime);

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    await prisma.paymentMethod.deleteMany();
    await app.close();
  });

  describe('SupplementPaymentController (e2e)', () => {
    describe('SupplementPaymentController (e2e)', () => {
      // add payment card to supplement user // not passing because of fingerprint duplicate on the test cards
      it(
        '/payments/add-card(POST) should add card to supplement user account',
        async () => {
          const response = await request(app.getHttpServer())
            .post('/payments/add-card?isSupplementApp=true')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ paymentMethodId: paymentMethodId, stripeCustomerId })
            .expect(201);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
          const paymentMethod = await prisma.paymentMethod.findFirst({
            where: {
              userId,
              stripeCustomerId,
            },
          });
          expect(paymentMethod).toBeDefined();
        },
        testTime,
      );

      // return users payment options
      it(
        '/payments/options/:id(GET) should return user payment options',
        async () => {
          const response = await request(app.getHttpServer())
            .get(`/payments/options/${stripeCustomerId}?isSupplementApp=true`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
        },
        testTime,
      );

      // create payment intent for supplement user
      it(
        '/payments/intent(POST) should create payment intent',
        async () => {
          const response = await request(app.getHttpServer())
            .post('/payments/intent?isSupplementApp=true')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
              amount: 1000,
              currency: 'gbp',
              customerId: stripeCustomerId,
              paymentMethodId,
            })
            .expect(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
          paymentIntentId = response.body.data.paymentIntentId;
        },
        testTime,
      );

      // create payment intent for top up
      it(
        '/payments/intent(POST) should create payment intent for top up',
        async () => {
          const response = await request(app.getHttpServer())
            .post('/payments/intent?isSupplementApp=true')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
              amount: 1000,
              currency: 'gbp',
              customerId: stripeCustomerId,
              paymentMethodId,
            })
            .expect(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
          paymentIntentIdForTopUp = response.body.data.paymentIntentId;
        },
        testTime,
      );

      // capture payment intent
      it(
        '/payments/intent/capture(POST) should capture payment intent for supplement customers',
        async () => {
          const response = await request(app.getHttpServer())
            .post('/payments/intent/capture?isSupplementApp=true')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ paymentIntentId, teamId, userId, amount: 1000 })
            .expect(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
        },
        testTime,
      );

      // handle yearly subscription
      it(
        '/payments/subscription/yearly/:userId(POST) should process yearly subscription',
        async () => {
          const response = await request(app.getHttpServer())
            .post(`/payments/subscription/yearly/${userId}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);
          
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(response.body.data.status).toBe(PaymentStatus.CAPTURED);
          expect(response.body.data.type).toBe(PaymentType.YEARLY_SUBSCRIPTION);
          expect(response.body.data.amount).toBe("28");
          expect(response.body.data.expiryDate).toBeDefined();
        },
        testTime,
      );

      // get subscription status
      it(
        '/payments/subscription/status/:userId(GET) should return subscription status',
        async () => {
          const response = await request(app.getHttpServer())
            .get(`/payments/subscription/status/${userId}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);
          
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(response.body.data).toHaveProperty('hasActiveSubscription');
          expect(response.body.data).toHaveProperty('expiryDate');
          expect(typeof response.body.data.hasActiveSubscription).toBe('boolean');
          expect(response.body.data.expiryDate).toBeDefined();
          expect(new Date(response.body.data.expiryDate) > new Date()).toBe(true);
        },
        testTime,
      );

      // top up payment
      it(
        '/payments/supplement/topup(POST) should process payment for supplement topup',
        async () => {
          const response = await request(app.getHttpServer())
            .post('/payments/supplement/topup')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
              paymentIntentId: paymentIntentIdForTopUp,
              teamId,
              userId,
              amount: 1000,
              productId,
              quantity: 2,
              price: 2,
              capsulePerDay: 1,
            })
            .expect(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
        },
        testTime,
      );

      // process joining active supplement team
      it(
        '/payments/supplement/join-team should process payment for supplement active team',
        async () => {
          const response = await request(app.getHttpServer())
            .post('/payments/supplement/join-team')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
              amount: 1000,
              currency:'gbp',
              teamId,
              productId,
              quantity: 7,
              price: 100,
              capsulePerDay: 3,
              topupQuantity:5,
              paymentMethodId,
              userId,
              teamStatus: SupplementTeamStatus.ACTIVE,
            })
            .expect(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
        },
        testTime,
      );

      // process joining pre order supplement team
      it(
        '/payments/supplement/join-team(POST) should process payment for supplement active team',
        async () => {
          const response = await request(app.getHttpServer())
            .post('/payments/supplement/join-team')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
              teamId: team2Id,
              productId: product2Id,
              quantity: 7,
              price: 100,
              capsulePerDay: 3,
              userId,
              teamStatus: SupplementTeamStatus.PREORDER,
            })
            .expect(200);
          expect(response.body).toHaveProperty('data');
          expect(response.body.error).toBeUndefined();
          expect(typeof response.body.data).toBe('object');
        },
        testTime,
      );
    })
  });
});
