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
  let customerId: string;
  let paymentMethodId: string;
  let userId: string;
  let product: Product;
  let order: Order;
  let itemId: string;

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
  }, 120000);

  afterAll(async () => {
    await app.close();
  });

  describe('PaymentController (e2e)', () => {
    // add payment card to user
    it('/payments/add-card(POST) should add card to user account', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/add-card')
        .send({ ...cardInfo })
        .expect(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
      customerId = response.body.data.stripeCustomerId;
      paymentMethodId = response.body.data.paymentMethodId;
    }, 120000);

    // charge user successfully
    it('/payments/charge(POST) should charge a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/charge')
        .send({ ...chargeInfo, customerId, paymentMethodId })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    }, 120000);

    it('/payments/charge(POST) should not charge a user if uncompleted data is supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/charge')
        .send({ ...chargeInfo })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    describe('Basket', () => {
      // add user bulk basket successfully
      it('/payments/basket-bulk(POST) should add a users bulk cart to basket', async () => {
        const userBasket = {
          basket: [
            {
              orderId: order.id,
              userId: userId,
              productId: product.id,
              quantity: 2,
              price: '2000',
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
      }, 120000);

      it('/payments/basket-bulk(POST) should not add item to basket if uncompleted data is supplied', async () => {
        const userBasket = {
          basket: [
            {
              userId: userId,
              productId: product.id,
              quantity: 2,
              price: '2000',
            },
          ],
        };
        const response = await request(app.getHttpServer())
          .post('/payments/basket-bulk')
          .send(userBasket)
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      });

      // add single item to basket
      it('/payments/basket(POST) should add a single item to basket', async () => {
        const basket = {
          orderId: order.id,
          userId: userId,
          productId: product.id,
          quantity: 2,
          price: '2000',
        };
        const response = await request(app.getHttpServer())
          .post('/payments/basket')
          .send(basket)
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        itemId = response.body.data.id;
      }, 120000);

      it('/payments/basket(POST) should not add a single item to basket if uncompleted data is supplied', async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/create')
          .send({ orderId: order.id })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      });

      // delete item from cart
      it('/payments/basket/:id(DELETE) should delete item from cart', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/payments/basket/${itemId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      });
    });
  });
});
