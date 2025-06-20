import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TeamsServiceExtension } from './teams.service.extension';
import { MembershipStatus, SupplementTeamStatus } from '@prisma/client';

describe('TeamsService', () => {
  let service: TeamsService;

  const mockPrismaService = {};

  const mockPaymentService = {
    getTeamLatestOrder: jest.fn(),
  };

  const mockUsersService = {};
  const mockNotificationsService = {};
  const mockTeamsServiceExtension = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: TeamsServiceExtension,
          useValue: mockTeamsServiceExtension,
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('determineTeamMembershipRole', () => {
    it('should return assigned role if provided', async () => {
      const team = {
        id: 'team1',
        supplementTeamProducts: null,
      } as any;

      const result = await service.determineTeamMembershipRole(
        team,
        MembershipStatus.ADMIN,
      );

      expect(result).toBe(MembershipStatus.ADMIN);
    });

    it('should return FOUNDING_MEMBER for PREORDER supplement teams', async () => {
      const team = {
        id: 'team1',
        supplementTeamProducts: {
          status: SupplementTeamStatus.PREORDER,
          orderTreashold: 10,
          product: {
            leadTime: 2,
            id: 'product1',
            name: 'Test Product',
          },
        },
      } as any;

      const result = await service.determineTeamMembershipRole(team);

      expect(result).toBe(MembershipStatus.FOUNDING_MEMBER);
    });

    it('should return EARLY_MEMBER for ACTIVE supplement teams with firstDelivery true', async () => {
      const team = {
        id: 'team1',
        supplementTeamProducts: {
          status: SupplementTeamStatus.ACTIVE,
          orderTreashold: 10,
          product: {
            leadTime: 2,
            id: 'product1',
            name: 'Test Product',
          },
        },
      } as any;

      mockPaymentService.getTeamLatestOrder.mockResolvedValue({
        id: 'order1',
        firstDelivery: true,
        deadline: new Date(),
        deliveryDate: new Date(),
        team: {
          supplementTeamProducts: {
            product: {
              leadTime: 2,
            },
          },
        },
      });

      const result = await service.determineTeamMembershipRole(team);

      expect(result).toBe(MembershipStatus.EARLY_MEMBER);
      expect(mockPaymentService.getTeamLatestOrder).toHaveBeenCalledWith('team1');
    });

    it('should return MEMBER for ACTIVE supplement teams with firstDelivery false', async () => {
      const team = {
        id: 'team1',
        supplementTeamProducts: {
          status: SupplementTeamStatus.ACTIVE,
          orderTreashold: 10,
          product: {
            leadTime: 2,
            id: 'product1',
            name: 'Test Product',
          },
        },
      } as any;

      mockPaymentService.getTeamLatestOrder.mockResolvedValue({
        id: 'order1',
        firstDelivery: false,
        deadline: new Date(),
        deliveryDate: new Date(),
        team: {
          supplementTeamProducts: {
            product: {
              leadTime: 2,
            },
          },
        },
      });

      const result = await service.determineTeamMembershipRole(team);

      expect(result).toBe(MembershipStatus.MEMBER);
    });

    it('should return MEMBER for ACTIVE supplement teams with no orders', async () => {
      const team = {
        id: 'team1',
        supplementTeamProducts: {
          status: SupplementTeamStatus.ACTIVE,
          orderTreashold: 10,
          product: {
            leadTime: 2,
            id: 'product1',
            name: 'Test Product',
          },
        },
      } as any;

      mockPaymentService.getTeamLatestOrder.mockResolvedValue(null);

      const result = await service.determineTeamMembershipRole(team);

      expect(result).toBe(MembershipStatus.MEMBER);
    });

    it('should return MEMBER for teams without supplement products', async () => {
      const team = {
        id: 'team1',
        supplementTeamProducts: null,
      } as any;

      const result = await service.determineTeamMembershipRole(team);

      expect(result).toBe(MembershipStatus.MEMBER);
    });
  });
}); 