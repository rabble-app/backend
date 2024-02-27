import { Test, TestingModule } from '@nestjs/testing';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { PrismaService } from '../prisma.service';

describe('InsightsController', () => {
  let controller: InsightsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
      providers: [InsightsService, PrismaService],
    }).compile();

    controller = module.get<InsightsController>(InsightsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
