import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UsersService } from './users.service';
import { ParametersModule } from '../config/config.module';
import { UsersServiceExtension } from './users.service.extension';
import { LoggerModule } from '../utils/logger.module';
import { StripeService } from '../stripe/stripe.service';
import { mockStripeService } from '../../test/mocks';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersServiceExtension,
        PrismaService,
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
      imports: [ParametersModule, LoggerModule],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
