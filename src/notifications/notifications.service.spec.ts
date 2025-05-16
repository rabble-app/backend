import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';
import { FirebaseService } from './firebase.service';
import { mockFirebaseService, mockAwsParameters } from '../../test/mocks';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        PrismaService,
        JwtService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: 'AWS_PARAMETERS',
          useValue: mockAwsParameters,
        },
      ],
      imports: [ParametersModule],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
