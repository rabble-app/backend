import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';
import { UploadsService } from '../uploads/uploads.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { TeamsModule } from '../teams/teams.module';
import { TeamsServiceExtension2 } from '../teams/teams.service.extension2';
import { PaymentModule } from '../payment/payment.module';

describe('StoreController', () => {
  let controller: StoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        StoreService,
        PrismaService,
        JwtService,
        UploadsService,
        UsersService,
        TeamsServiceExtension2,
      ],
      imports: [ParametersModule, UsersModule, TeamsModule, PaymentModule],
    }).compile();

    controller = module.get<StoreController>(StoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
