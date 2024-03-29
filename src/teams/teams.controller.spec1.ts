import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { PaymentService } from '../payment/payment.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { TeamsServiceExtension } from './teams.service.extension';
import { TeamsServiceExtension2 } from './teams.service.extension2';
import { TeamsModule } from './teams.module';

describe('TeamsController', () => {
  let controller: TeamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
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
      ],
      imports: [TeamsModule],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
