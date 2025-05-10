import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { PrismaService } from '../../src/prisma.service';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { TeamsServiceExtension } from '../../src/teams/teams.service.extension';
import { TeamsService } from '../../src/teams/teams.service';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { PaymentService } from '../../src/payment/payment.service';
import { ProductsService } from '../../src/products/products.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';
import { LoggerModule } from '../utils/logger.module';
import { RollbarModule } from '../utils/rollbar.module';
import { ReferralsService } from '../referrals/referrals.service';
import { PaymentServiceExtension } from '../payment/payment.service.extension';
import { StripeService } from '../stripe/stripe.service';
import { FirebaseService } from '../notifications/firebase.service';
import {
  mockAwsParameters,
  mockStripeService,
  mockFirebaseService,
  mockCourierService,
} from '../../test/mocks';
import { CourierService } from '../notifications/courier.service';
describe('ChatsController', () => {
  let controller: ChatsController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        ChatsService,
        PrismaService,
        NotificationsService,
        TeamsServiceExtension,
        TeamsService,
        AuthService,
        UsersService,
        PaymentService,
        ProductsService,
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
          provide: 'AWS_PARAMETERS',
          useValue: mockAwsParameters,
        },
        {
          provide: CourierService,
          useValue: mockCourierService,
        },
      ],
      imports: [ParametersModule, LoggerModule, RollbarModule],
    }).compile();

    controller = module.get<ChatsController>(ChatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
