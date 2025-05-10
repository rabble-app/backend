import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { TeamsServiceExtension } from '../../src/teams/teams.service.extension';
import { TeamsService } from '../../src/teams/teams.service';
import { ProductsService } from '../../src/products/products.service';
import { AuthService } from '../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';
import { LoggerModule } from '../utils/logger.module';
import { RollbarModule } from '../utils/rollbar.module';
import { ReferralsService } from '../referrals/referrals.service';
import { PaymentServiceExtension } from './payment.service.extension';
import { StripeService } from '../stripe/stripe.service';
import { FirebaseService } from '../notifications/firebase.service';
import { CourierService } from '../notifications/courier.service';
import {
  mockStripeService,
  mockFirebaseService,
  mockCourierService,
} from '../../test/mocks';

describe('PaymentController', () => {
  let controller: PaymentController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        PaymentService,
        PrismaService,
        UsersService,
        NotificationsService,
        TeamsServiceExtension,
        TeamsService,
        ProductsService,
        AuthService,
        JwtService,
        ReferralsService,
        PaymentServiceExtension,
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: CourierService,
          useValue: mockCourierService,
        },
      ],
      imports: [ParametersModule, LoggerModule, RollbarModule],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
