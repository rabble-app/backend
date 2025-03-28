import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { TeamsServiceExtension } from '../../src/teams/teams.service.extension';
import { TeamsService } from '../../src/teams/teams.service';
import { ProductsService } from '../../src/products/products.service';
import { ParametersModule } from '../config/config.module';
import { LoggerModule } from '../utils/logger.module';
import { ReferralsService } from '../referrals/referrals.service';
import { RollbarModule } from '../utils/rollbar.module';
import { PaymentServiceExtension } from '../payment/payment.service.extension';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        JwtService,
        PrismaService,
        PaymentService,
        NotificationsService,
        TeamsServiceExtension,
        TeamsService,
        ProductsService,
        ReferralsService,
        PaymentServiceExtension
      ],
      imports: [ParametersModule, LoggerModule, RollbarModule],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
