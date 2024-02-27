import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { UsersService } from '../../src/users/users.service';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { PaymentService } from '../../src/payment/payment.service';
import { PrismaService } from '../../src/prisma.service';
import { ProductsService } from '../../src/products/products.service';
import { PaymentServiceExtension } from '../../src/payment/payment.service.extension';
import { ScheduleServiceExtended } from './schedule.service.extended';
import { TeamsServiceExtension } from '../../src/teams/teams.service.extension';
import { TeamsService } from '../../src/teams/teams.service';
import { AuthService } from '../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';
import { InsightsService } from '../insights/insights.service';

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
        PaymentServiceExtension,
        ScheduleServiceExtended,
        UsersService,
        NotificationsService,
        TeamsServiceExtension,
        TeamsService,
        ProductsService,
        AuthService,
        JwtService,
        InsightsService,
      ],
      imports: [ParametersModule],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
