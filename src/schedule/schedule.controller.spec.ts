import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { UsersService } from '../users/users.service';
import { PaymentService } from '../payment/payment.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma.service';
import { ProductsService } from '../products/products.service';
import { PaymentServiceExtension } from '../payment/payment.service.extension';
import { ScheduleServiceExtended } from './schedule.service.extended';
import { TeamsService } from '../teams/teams.service';
import { TeamsServiceExtension } from '../teams/teams.service.extension';
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
describe('ScheduleController', () => {
  let controller: ScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
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
            /* mock PrismaService */
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
        ScheduleServiceExtended,
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
          useValue: mockCourierService,
        },
      ],
      imports: [ParametersModule, LoggerModule, RollbarModule],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
