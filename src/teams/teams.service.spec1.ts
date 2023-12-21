import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { TeamsServiceExtension } from './teams.service.extension';
import { TeamsServiceExtension2 } from './teams.service.extension2';

describe('TeamsService', () => {
  let service: TeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        PrismaService,
        UsersService,
        PaymentService,
        NotificationsService,
        AuthService,
        JwtService,
        TeamsServiceExtension,
        TeamsServiceExtension2,
        TeamsService,
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
