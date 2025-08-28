import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TeamsServiceExtension } from '../teams/teams.service.extension';
import { TeamsService } from '../teams/teams.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { PaymentService } from '../payment/payment.service';
import { ProductsService } from '../products/products.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';
import { LoggerModule } from '../utils/logger.module';
import { RollbarModule } from '../utils/rollbar.module';
import { ReferralsService } from '../referrals/referrals.service';
import { PaymentServiceExtension } from '../payment/payment.service.extension';
import { StripeService } from '../stripe/stripe.service';
import { FirebaseService } from '../notifications/firebase.service';
import {
  mockStripeService,
  mockFirebaseService,
  mockAwsParameters,
  mockCourierService,
} from '../../test/mocks';
import { CourierService } from '../notifications/courier.service';
describe('ChatsService', () => {
  let service: ChatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        {
          provide: PrismaService,
          useValue: { /* mock PrismaService */ },
        },
        {
          provide: NotificationsService,
          useValue: { /* mock NotificationsService */ },
        },
        {
          provide: TeamsServiceExtension,
          useValue: { /* mock TeamsServiceExtension */ },
        },
        {
          provide: TeamsService,
          useValue: { /* mock TeamsService */ },
        },
        {
          provide: AuthService,
          useValue: { /* mock AuthService */ },
        },
        {
          provide: UsersService,
          useValue: { /* mock UsersService */ },
        },
        {
          provide: PaymentService,
          useValue: { /* mock PaymentService */ },
        },
        {
          provide: ProductsService,
          useValue: { /* mock ProductsService */ },
        },
        {
          provide: JwtService,
          useValue: { /* mock JwtService */ },
        },
        {
          provide: ReferralsService,
          useValue: { /* mock ReferralsService */ },
        },
        {
          provide: PaymentServiceExtension,
          useValue: { /* mock PaymentServiceExtension */ },
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

    service = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
