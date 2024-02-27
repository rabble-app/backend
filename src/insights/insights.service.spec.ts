import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { PrismaService } from '../prisma.service';

describe('InsightsService', () => {
  let service: InsightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsightsService, PrismaService],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
