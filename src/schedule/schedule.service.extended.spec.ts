import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleServiceExtended } from './schedule.service.extended';
import { PrismaService } from '../prisma.service';
import { PaymentService } from '../payment/payment.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InsightsService } from '../insights/insights.service';
import { QRCodeService } from '../qrcode/qrcode.service';
import { TeamsService } from '../teams/teams.service';
import { PaymentServiceExtension } from '../payment/payment.service.extension';
import { OrderStatus, OrderType, PaymentStatus } from '@prisma/client';
import { CourierService } from '../notifications/courier.service';

describe('ScheduleServiceExtended', () => {
  let service: ScheduleServiceExtended;


  const mockPrismaService = {
    supplementTeamProducts: {
      findMany: jest.fn(),
    },
    teamMember: {
      findMany: jest.fn(),
    },
    basketC: {
      findMany: jest.fn(),
    },
    basket: {
      create: jest.fn(),
    },
    topUpBasket: {
      create: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockTeamsService = {
    updateSupplementProductTeam: jest.fn(),
  };

  const mockPaymentService = {
    createOrder: jest.fn(),
    recordPayment: jest.fn(),
  };

  const mockPaymentServiceExtension = {
    checkUserSubscriptionStatus: jest.fn(),
    handleYearlySubscription: jest.fn(),
  };

  const mockProductsService = {
    getPriceDiscount: jest.fn(),
  };

  const mockCourierService = {
    sendCoinEarnedMail: jest.fn(),
    sendReferralFreeMonthMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleServiceExtended,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TeamsService,
          useValue: mockTeamsService,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: PaymentServiceExtension,
          useValue: mockPaymentServiceExtension,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: NotificationsService,
          useValue: {},
        },
        {
          provide: InsightsService,
          useValue: {},
        },
        {
          provide: QRCodeService,
          useValue: {},
        },
        {
          provide: CourierService,
          useValue: mockCourierService,
        },
        {
          provide: 'AWS_PARAMETERS',
          useValue: {
            SUPPLEMENT_EMAIL_URL: 'https://test.com',
            SUPPLEMENT_DASHBOARD_URL: 'https://test.com',
          },
        },
      ],
    }).compile();

    service = module.get<ScheduleServiceExtended>(ScheduleServiceExtended);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('activatePreOrderTeams', () => {
    it('should activate pre-order teams when threshold is met', async () => {
      const mockSupplements = [{
        id: '1',
        teamId: 'team1',
        orderTreashold: 10,
        product: {
          leadTime: 2,
        },
        team: {
          _count: {
            members: 3, // 30% of threshold (10)
          },
        },
      }];

      mockPrismaService.supplementTeamProducts.findMany.mockResolvedValue(mockSupplements);
      mockTeamsService.updateSupplementProductTeam.mockResolvedValue({});
      mockPaymentService.createOrder.mockResolvedValue({ id: 'order1' });

      const result = await service.activatePreOrderTeams();

      expect(result).toBe(true);
      expect(mockPrismaService.supplementTeamProducts.findMany).toHaveBeenCalledWith({
        where: {
          status: 'PREORDER',
        },
        select: {
          id: true,
          teamId: true,
          orderTreashold: true,
          product: {
            select: {
              leadTime: true,
            },
          },
          team: {
            select: {
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
      });
      expect(mockTeamsService.updateSupplementProductTeam).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'ACTIVE' },
      });
      expect(mockPaymentService.createOrder).toHaveBeenCalledWith(expect.objectContaining({
        teamId: 'team1',
        status: OrderStatus.PENDING,
        type: OrderType.SUPPLEMENT,
        firstDelivery: true,
      }));
    });

    it('should not activate pre-order teams when threshold is not met', async () => {
      const mockSupplements = [{
        id: '1',
        teamId: 'team1',
        orderTreashold: 10,
        product: {
          leadTime: 2,
        },
        team: {
          _count: {
            members: 1, // 10% of threshold (10)
          },
        },
      }];

      mockPrismaService.supplementTeamProducts.findMany.mockResolvedValue(mockSupplements);

      const result = await service.activatePreOrderTeams();

      expect(result).toBe(true);
      expect(mockTeamsService.updateSupplementProductTeam).not.toHaveBeenCalled();
      expect(mockPaymentService.createOrder).not.toHaveBeenCalled();
    });
  });

  describe('createSupplementUsersBasket', () => {
    it('should create supplement users basket successfully', async () => {
      const teamId = 'team1';
      const orderId = 'order1';
      const duration = 91;

      const mockTeamMembers = [{
        id: 'member1',
        role: 'FOUNDING_MEMBER',
        userId: 'user1',
      }];

      const mockBasket = [{
        capsulePerDay: 2,
        productId: 'product1',
        product: {
          id: 'product1',
          priceInfo: [],
          price: 100,
          status: 'ACTIVE',
          subUnit: 'capsules',
          supplementTeamProducts: {
            foundingMembersDiscount: 10,
            earlyMembersDiscount: 5,
            status: 'ACTIVE',
          },
        },
      }];

      mockPrismaService.teamMember.findMany.mockResolvedValue(mockTeamMembers);
      mockPrismaService.basketC.findMany.mockResolvedValue(mockBasket);
      mockPaymentServiceExtension.checkUserSubscriptionStatus.mockResolvedValue(true);
      mockProductsService.getPriceDiscount.mockReturnValue(0);
      mockPrismaService.basket.create.mockResolvedValue({});
      mockPaymentService.recordPayment.mockResolvedValue({});

      const result = await service.createSupplementUsersBasket(teamId, orderId, duration);

      expect(result).toBe(true);
      expect(mockPrismaService.teamMember.findMany).toHaveBeenCalledWith({
        where: {
          teamId,
          skipNextDelivery: false,
          subscriptionStatus: 'ACTIVE',
          status: 'APPROVED',
        },
        select: {
          id: true,
          role: true,
          userId: true,
        },
      });

      // Verify getPriceDiscount was called with correct parameters
      expect(mockProductsService.getPriceDiscount).toHaveBeenCalledWith(
        [],
        1, // teamMembers.length
        'ACTIVE' // status from mock data
      );

      // Calculate expected values based on the actual implementation
      const basePrice = 100; // Original price
      const expectedQuantity = 2 * 3; // capsulePerDay * 3 (for quarter)
      const priceWithDiscount = basePrice; // No dynamic price discount in this case
      let productPrice = priceWithDiscount * expectedQuantity; // 100 * 6 = 600
      
      // Apply founding member discount
      productPrice = productPrice - (productPrice * 10 / 100); // 10% founding member discount
      // Verify basket creation with correct quantity calculation
      expect(mockPrismaService.basket.create).toHaveBeenCalledWith({
        data: {
          orderId,
          userId: 'user1',
          productId: 'product1',
          quantity: expectedQuantity,
          price: productPrice,
          capsulePerDay: 2
        },
      });

      // Verify payment record
      expect(mockPaymentService.recordPayment).toHaveBeenCalledWith({
        orderId,
        userId: 'user1',
        amount: productPrice, // Total amount is the same as productPrice since we have only one product
        status: PaymentStatus.PENDING,
      });
    });

    it('should handle user without active subscription', async () => {
      const teamId = 'team1';
      const orderId = 'order1';
      const duration = 91;

      const mockTeamMembers = [{
        id: 'member1',
        role: 'MEMBER',
        userId: 'user1',
      }];

      mockPrismaService.teamMember.findMany.mockResolvedValue(mockTeamMembers);
      mockPaymentServiceExtension.checkUserSubscriptionStatus.mockResolvedValue(false);
      mockPaymentServiceExtension.handleYearlySubscription.mockResolvedValue(false);

      const result = await service.createSupplementUsersBasket(teamId, orderId, duration);

      expect(result).toBe(true);
      expect(mockPrismaService.basketC.findMany).not.toHaveBeenCalled();
      expect(mockPrismaService.basket.create).not.toHaveBeenCalled();
      expect(mockPaymentService.recordPayment).not.toHaveBeenCalled();
    });

    it('should handle products with grams as subUnit', async () => {
      const teamId = 'team1';
      const orderId = 'order1';
      const duration = 91;

      const mockTeamMembers = [{
        id: 'member1',
        role: 'MEMBER',
        userId: 'user1',
      }];

      const mockBasket = [{
        capsulePerDay: 5,
        productId: 'product1',
        product: {
          id: 'product1',
          priceInfo: [],
          price: 100,
          status: 'ACTIVE',
          subUnit: 'grams',
          supplementTeamProducts: {
            foundingMembersDiscount: 0,
            earlyMembersDiscount: 0,
            status: 'ACTIVE',
          },
        },
      }];

      mockPrismaService.teamMember.findMany.mockResolvedValue(mockTeamMembers);
      mockPrismaService.basketC.findMany.mockResolvedValue(mockBasket);
      mockPaymentServiceExtension.checkUserSubscriptionStatus.mockResolvedValue(true);
      mockProductsService.getPriceDiscount.mockReturnValue(0);
      mockPrismaService.basket.create.mockResolvedValue({});
      mockPaymentService.recordPayment.mockResolvedValue({});

      const result = await service.createSupplementUsersBasket(teamId, orderId, duration);

      expect(result).toBe(true);
      expect(mockPrismaService.basket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId,
          userId: 'user1',
          productId: 'product1',
          quantity: 3, // (5 capsules per day / 5) * 3 (for quarter)
          price: 300,
        }),
      });

      // Verify getPriceDiscount was called with correct parameters
      expect(mockProductsService.getPriceDiscount).toHaveBeenCalledWith(
        [],
        1, // teamMembers.length
        'ACTIVE' // status from mock data
      );
    });

    it('should use lowest discount for PREORDER status', async () => {
      const teamId = 'team1';
      const orderId = 'order1';
      const duration = 91;

      const mockTeamMembers = [{
        id: 'member1',
        role: 'MEMBER',
        userId: 'user1',
      }];

      const mockBasket = [{
        capsulePerDay: 2,
        productId: 'product1',
        product: {
          id: 'product1',
          priceInfo: [
            { teamMemberCount: 5, percentageDiscount: 10 },
            { teamMemberCount: 10, percentageDiscount: 15 },
            { teamMemberCount: 20, percentageDiscount: 20 }
          ],
          price: 100,
          status: 'ACTIVE',
          subUnit: 'capsules',
          supplementTeamProducts: {
            foundingMembersDiscount: 0,
            earlyMembersDiscount: 0,
            status: 'PREORDER',
          },
        },
      }];

      mockPrismaService.teamMember.findMany.mockResolvedValue(mockTeamMembers);
      mockPrismaService.basketC.findMany.mockResolvedValue(mockBasket);
      mockPaymentServiceExtension.checkUserSubscriptionStatus.mockResolvedValue(true);
      mockProductsService.getPriceDiscount.mockReturnValue(10); // Lowest discount
      mockPrismaService.basket.create.mockResolvedValue({});
      mockPaymentService.recordPayment.mockResolvedValue({});

      const result = await service.createSupplementUsersBasket(teamId, orderId, duration);

      expect(result).toBe(true);
      
      // Verify getPriceDiscount was called with PREORDER status
      expect(mockProductsService.getPriceDiscount).toHaveBeenCalledWith(
        [
          { teamMemberCount: 5, percentageDiscount: 10 },
          { teamMemberCount: 10, percentageDiscount: 15 },
          { teamMemberCount: 20, percentageDiscount: 20 }
        ],
        1, // teamMembers.length
        'PREORDER' // status from mock data
      );
    });
  });

  describe('createSupplementOrders', () => {
    beforeEach(() => {
      // Spy on the createSupplementUsersBasket method
      jest.spyOn(service, 'createSupplementUsersBasket').mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create new orders for expired supplement orders', async () => {
      const mockExpiredOrders = [{
        id: 'order1',
        teamId: 'team1',
        team: {
          supplementTeamProducts: {
            product: {
              leadTime: 2,
            },
          },
        },
      }];

      const mockNewOrder = { id: 'newOrder1' };

      // Mock the findMany call for expired orders
      mockPrismaService.order.findMany = jest.fn().mockResolvedValue(mockExpiredOrders);
      
      // Mock the updateMany call
      mockPrismaService.order.updateMany = jest.fn().mockResolvedValue({});

      // Mock createOrder
      mockPaymentService.createOrder.mockResolvedValue(mockNewOrder);

      await service.createSupplementOrders();

      // Verify expired orders query
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: {
          type: OrderType.SUPPLEMENT,
          status: OrderStatus.PENDING,
          deliveryDate: {
            not: null,
            lte: expect.any(Date),
          },
        },
        select: {
          id: true,
          teamId: true,
          team: {
            select: {
              supplementTeamProducts: {
                select: {
                  product: {
                    select: {
                      leadTime: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Verify new order creation
      expect(mockPaymentService.createOrder).toHaveBeenCalledWith({
        teamId: 'team1',
        status: OrderStatus.PENDING,
        type: OrderType.SUPPLEMENT,
        deadline: expect.any(Date),
        deliveryDate: expect.any(Date),
      });

      // Verify basket creation was called
      expect(service.createSupplementUsersBasket).toHaveBeenCalledWith(
        'team1',
        'newOrder1',
        91
      );

      // Verify status update of expired orders
      expect(mockPrismaService.order.updateMany).toHaveBeenCalledWith({
        where: {
          type: OrderType.SUPPLEMENT,
          status: OrderStatus.PENDING,
          deliveryDate: {
            not: null,
            lte: expect.any(Date),
          },
        },
        data: {
          status: OrderStatus.PENDING_DELIVERY,
        },
      });
    });

    it('should handle case when no expired orders exist', async () => {
      // Mock empty expired orders
      mockPrismaService.order.findMany = jest.fn().mockResolvedValue([]);
      mockPrismaService.order.updateMany = jest.fn().mockResolvedValue({});

      await service.createSupplementOrders();

      expect(mockPaymentService.createOrder).not.toHaveBeenCalled();
      expect(mockPrismaService.order.updateMany).toHaveBeenCalled();
    });
  });
}); 