import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/auth/auth.service';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { ProductsService } from '../../src/products/products.service';
import { TeamsService } from '../../src/teams/teams.service';
import { TeamsServiceExtension } from '../../src/teams/teams.service.extension';
import { ParametersModule } from '../config/config.module';
import { LoggerModule } from '../utils/logger.module';
import { RollbarModule } from '../utils/rollbar.module';
import { ReferralsService } from '../referrals/referrals.service';
import { PaymentServiceExtension } from './payment.service.extension';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        UsersService,
        PrismaService,
        NotificationsService,
        TeamsServiceExtension,
        TeamsService,
        ProductsService,
        AuthService,
        JwtService,
        ReferralsService,
        PaymentServiceExtension
      ],
      imports: [ParametersModule, LoggerModule, RollbarModule],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
