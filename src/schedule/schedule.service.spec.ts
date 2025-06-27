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
import { QRCodeService } from '../qrcode/qrcode.service';
import { UploadsService } from '../uploads/uploads.service';
import { LoggerModule } from '../utils/logger.module';
import { RollbarModule } from '../utils/rollbar.module';
import { ReferralsService } from '../referrals/referrals.service';
import { StripeService } from '../stripe/stripe.service';
import { FirebaseService } from '../notifications/firebase.service';
import {
  mockStripeService,
  mockFirebaseService,
  mockAwsParameters,
  mockCourierService,
} from '../../test/mocks';
import { CourierService } from '../notifications/courier.service';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let scheduleServiceExtended: ScheduleServiceExtended;

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
        QRCodeService,
        UploadsService,
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

    service = module.get<ScheduleService>(ScheduleService);
    scheduleServiceExtended = module.get<ScheduleServiceExtended>(ScheduleServiceExtended);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleLastDayFreeMembershipBonus', () => {
    it('should handle last day free membership bonus emails', async () => {
      const result = await scheduleServiceExtended.handleLastDayFreeMembershipBonus();
      expect(result).toBe(true);
    });
  });

  describe('handle15thDayFreeMembershipBonus', () => {
    it('should handle 15th day free membership bonus emails', async () => {
      const result = await scheduleServiceExtended.handle15thDayFreeMembershipBonus();
      expect(result).toBe(true);
    });
  });

  describe('handleLast3DaysFreeMembershipBonus', () => {
    it('should handle last 3 days free membership bonus emails', async () => {
      const result = await scheduleServiceExtended.handleLast3DaysFreeMembershipBonus();
      expect(result).toBe(true);
    });
  });
});
