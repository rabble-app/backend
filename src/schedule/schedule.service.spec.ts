import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { UsersService } from '../../src/users/users.service';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { PaymentService } from '../../src/payment/payment.service';
import { PrismaService } from '../../src/prisma.service';
import { ProductsService } from '../../src/products/products.service';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        UsersService,
        PaymentService,
        NotificationsService,
        PrismaService,
        ProductsService,
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
