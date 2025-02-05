import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { ParametersModule } from '../config/config.module';
import { LoggerModule } from '../utils/logger.module';
import { ReferralsService } from '../referrals/referrals.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { RollbarModule } from '../utils/rollbar.module';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        WebhookService,
        ReferralsService,
        UsersService,
      ],
      imports: [ParametersModule, LoggerModule, RollbarModule],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
