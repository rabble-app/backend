import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { ParametersModule } from '../config/config.module';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookService],
      imports: [ParametersModule],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
