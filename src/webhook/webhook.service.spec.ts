import { Test, TestingModule } from '@nestjs/testing';
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

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const mockCourierService = {
      sendCoinEarnedMail: jest.fn(),
      sendReferralFreeMonthMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
