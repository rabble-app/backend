import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { ParametersModule } from '../config/config.module';
import { LoggerModule } from '../utils/logger.module';
import { ReferralsService } from '../referrals/referrals.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { RollbarModule } from '../utils/rollbar.module';
import { StripeService } from '../stripe/stripe.service';
import { CourierService } from '../notifications/courier.service';
import { mockStripeService } from '../../test/mocks';

describe('WebhookController', () => {
  let controller: WebhookController;

  beforeEach(async () => {
    const mockCourierService = {
      sendCoinEarnedMail: jest.fn(),
      sendReferralFreeMonthMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        PrismaService,
        WebhookService,
        ReferralsService,
        UsersService,
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: CourierService,
          useValue: mockCourierService,
        },
      ],
      imports: [ParametersModule, LoggerModule, RollbarModule],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
