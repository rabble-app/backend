import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';
import { FirebaseService } from './firebase.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let mockFirebaseService: any;

  beforeEach(async () => {
    mockFirebaseService = {
      sendPushNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
        PrismaService,
        JwtService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
      imports: [ParametersModule],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
