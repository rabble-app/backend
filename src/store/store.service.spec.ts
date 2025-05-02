import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { LoggerModule } from '../utils/logger.module';
import { StripeService } from '../stripe/stripe.service';
import { mockStripeService } from '../../test/mocks';

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        PrismaService,
        JwtService,
        UsersService,
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
      imports: [ParametersModule, UsersModule, LoggerModule],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
