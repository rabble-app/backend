import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService, UsersService, PrismaService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
