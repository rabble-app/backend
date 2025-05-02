import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';
import { mockStripeService } from '../../test/mocks';
import { StripeService } from '../stripe/stripe.service';
describe('Payment Endpoints', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StripeService)
      .useValue(mockStripeService)
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Payment Card Management', () => {
    it('/payments/add-card(POST) should add card to user account', async () => {
      // ... test implementation
    });
  });

  describe('Basket Management', () => {
    it('/payments/basket-bulk(POST) should add a users bulk cart to basket', async () => {
      // ... test implementation
    });
  });
});
