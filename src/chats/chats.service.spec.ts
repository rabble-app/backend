import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { PrismaService } from '../../src/prisma.service';
import { NotificationsService } from '../../src/notifications/notifications.service';
import { TeamsServiceExtension } from '../../src/teams/teams.service.extension';
import { TeamsService } from '../../src/teams/teams.service';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { PaymentService } from '../../src/payment/payment.service';
import { ProductsService } from '../../src/products/products.service';
import { JwtService } from '@nestjs/jwt';

describe('ChatsService', () => {
  let service: ChatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        PrismaService,
        NotificationsService,
        TeamsServiceExtension,
        TeamsService,
        AuthService,
        UsersService,
        PaymentService,
        ProductsService,
        JwtService,
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
