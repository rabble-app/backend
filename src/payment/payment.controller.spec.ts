import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TeamsServiceExtension } from '../teams/teams.service.extension';
import { TeamsService } from '../teams/teams.service';
import { ProductsService } from '../products/products.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';
import { LoggerModule } from '../utils/logger.module';
import { RollbarModule } from '../utils/rollbar.module';
import { ReferralsService } from '../referrals/referrals.service';
import { PaymentServiceExtension } from './payment.service.extension';
import { StripeService } from '../stripe/stripe.service';
import { FirebaseService } from '../notifications/firebase.service';
import { CourierService } from '../notifications/courier.service';
import { UsersServiceExtension } from '../users/users.service.extension';
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
        {
          provide: PrismaService,
          useValue: {
            /* mock PrismaService */
          },
        },
        {
          provide: UsersService,
          useValue: {
            /* mock UsersService */
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            /* mock NotificationsService */
          },
        },
        {
          provide: TeamsServiceExtension,
          useValue: {
            /* mock TeamsServiceExtension */
          },
        },
        {
          provide: TeamsService,
          useValue: {
            /* mock TeamsService */
          },
        },
        {
          provide: ProductsService,
          useValue: {
            /* mock ProductsService */
          },
        },
        {
          provide: AuthService,
          useValue: {
            /* mock AuthService */
          },
        },
        {
          provide: JwtService,
          useValue: {
            /* mock JwtService */
          },
        },
        {
          provide: ReferralsService,
          useValue: {
            /* mock ReferralsService */
          },
        },
        {
          provide: PaymentServiceExtension,
          useValue: {
            /* mock PaymentServiceExtension */
          },
        },
        {
          provide: UsersServiceExtension,
          useValue: {
            /* mock UsersServiceExtension */
          },
        },
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
