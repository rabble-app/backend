import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UsersService } from '../users/users.service';
import { TeamsService } from '../teams/teams.service';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProductsService } from '../products/products.service';
import { TeamsServiceExtension } from '../teams/teams.service.extension';
import { AuthService } from '../auth/auth.service';

describe('UploadsController', () => {
  let controller: UploadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        UploadsService,
        UsersService,
        PrismaService,
        TeamsService,
        PaymentService,
        NotificationsService,
        ProductsService,
        TeamsServiceExtension,
        AuthService,
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
