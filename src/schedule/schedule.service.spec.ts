import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentService } from '../payment/payment.service';
import { PrismaService } from '../prisma.service';
import { ProductsService } from '../products/products.service';
import { PaymentServiceExtension } from '../payment/payment.service.extension';
import { ScheduleServiceExtended } from './schedule.service.extended';
import { TeamsServiceExtension } from '../teams/teams.service.extension';
import { TeamsService } from '../teams/teams.service';
import { AuthService } from '../auth/auth.service';
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
        {
          provide: UsersService,
          useValue: {
            /* mock UsersService */
          },
        },
        {
          provide: PaymentService,
          useValue: {
            /* mock PaymentService */
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            /* mock NotificationsService */
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn().mockResolvedValue([
                {
                  id: '1',
                  email: 'test@example.com',
                  firstName: 'Test',
                  refCode: 'REF123',
                  userCode: 'USER123',
                  firstPaymentDate: new Date(),
                },
              ]),
            },
          },
        },
        {
          provide: ProductsService,
          useValue: {
            /* mock ProductsService */
          },
        },
        {
          provide: PaymentServiceExtension,
          useValue: {
            /* mock PaymentServiceExtension */
          },
        },
        {
          provide: ScheduleServiceExtended,
          useValue: {
            handleLastDayFreeMembershipBonus: jest.fn().mockResolvedValue(true),
            handle15thDayFreeMembershipBonus: jest.fn().mockResolvedValue(true),
            handleLast3DaysFreeMembershipBonus: jest
              .fn()
              .mockResolvedValue(true),
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
        InsightsService,
        QRCodeService,
        UploadsService,
        {
          provide: ReferralsService,
          useValue: {
            /* mock ReferralsService */
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
          provide: 'AWS_PARAMETERS',
          useValue: mockAwsParameters,
        },
        {
          provide: CourierService,
          useValue: {
            ...mockCourierService,
            sendLastDayOfFreeMembershipBonus: jest.fn().mockResolvedValue(true),
            send30DaysMidWayReminder: jest.fn().mockResolvedValue(true),
            sendLast3DaysOf30DaysReminder: jest.fn().mockResolvedValue(true),
          },
        },
      ],
      imports: [ParametersModule, LoggerModule, RollbarModule],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    scheduleServiceExtended = module.get<ScheduleServiceExtended>(
      ScheduleServiceExtended,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleLastDayFreeMembershipBonus', () => {
    it('should handle last day free membership bonus emails', async () => {
      const result =
        await scheduleServiceExtended.handleLastDayFreeMembershipBonus();
      expect(result).toBe(true);
    });
  });

  describe('handle15thDayFreeMembershipBonus', () => {
    it('should handle 15th day free membership bonus emails', async () => {
      const result =
        await scheduleServiceExtended.handle15thDayFreeMembershipBonus();
      expect(result).toBe(true);
    });
  });

  describe('handleLast3DaysFreeMembershipBonus', () => {
    it('should handle last 3 days free membership bonus emails', async () => {
      const result =
        await scheduleServiceExtended.handleLast3DaysFreeMembershipBonus();
      expect(result).toBe(true);
    });
  });
});
