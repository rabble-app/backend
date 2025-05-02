import { Test, TestingModule } from '@nestjs/testing';
import { ReferralsService } from './referrals.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import Stripe from 'stripe';
import { CC_TO_POUNDS_RATE } from '../utils/constants';
import { BonusType, ReferralType } from '@prisma/client';

describe('ReferralsService', () => {
  let service: ReferralsService;
  let mockLogger: any;
  let mockRollbar: any;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    bonus: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
    },
    claim: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    reward: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    referral: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    coupon: {
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockUsersService = {
    updateUser: jest.fn(),
    isEarlyUser: jest.fn(),
    isUserFirst30Days: jest.fn(),
    findUser: jest.fn(),
  };

  beforeEach(async () => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    mockRollbar = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: 'LOGGER',
          useValue: mockLogger,
        },
        {
          provide: 'ROLLBAR',
          useValue: mockRollbar,
        },
        {
          provide: 'AWS_PARAMETERS',
          useValue: { SUPPLEMENT_STRIPE_SECRET_KEY: 'test_key' },
        },
      ],
    }).compile();

    service = module.get<ReferralsService>(ReferralsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('generateReferralCode', () => {
    it('should generate a unique 6-character code', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const code = await service.generateReferralCode();

      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    it('should retry if generated code already exists', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({ id: 'existing-user' })
        .mockResolvedValueOnce(null);

      const code = await service.generateReferralCode();

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(2);
      expect(code).toHaveLength(6);
    });
  });

  describe('generateUserCode', () => {
    it('should generate a unique user code with first name prefix', async () => {
      const firstName = 'John';
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const code = await service.generateUserCode(firstName);

      expect(code).toMatch(
        new RegExp(`^${firstName.toUpperCase()}-[A-Z0-9]{3}$`),
      );
    });

    it('should retry if generated code already exists', async () => {
      const firstName = 'John';
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({ id: 'existing-user' })
        .mockResolvedValueOnce(null);

      const code = await service.generateUserCode(firstName);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(2);
      expect(code).toMatch(
        new RegExp(`^${firstName.toUpperCase()}-[A-Z0-9]{3}$`),
      );
    });
  });

  describe('handleReferral', () => {
    const mockMetadata: Stripe.Metadata = {
      order_id: 'order1',
      user_id: 'user1',
    };

    it('should handle first-time purchase with referral', async () => {
      const mockReferral = {
        referrerId: 'sponsor1',
        type: ReferralType.INTERNAL,
      };
      const mockSponsor = {
        id: 'sponsor1',
      };
      const mockPayment = {
        amount: 10000, // £100 in pence
        status: 'CAPTURED',
      };
      const mockWallet = {
        id: 'wallet1',
        userId: 'user1',
        balance: 0,
      };
      const mockUser = {
        id: 'user1',
      };

      mockUsersService.findUser.mockResolvedValueOnce(mockUser);
      mockPrismaService.referral.findFirst.mockResolvedValueOnce(mockReferral);
      mockPrismaService.payment.findMany.mockResolvedValueOnce([mockPayment]);
      mockUsersService.findUser.mockResolvedValueOnce(mockSponsor);
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);
      mockPrismaService.wallet.update.mockResolvedValueOnce(mockWallet);
      mockUsersService.isEarlyUser.mockResolvedValueOnce(false);
      mockUsersService.isUserFirst30Days.mockResolvedValueOnce(false);

      await service.handleReferral(mockMetadata, mockPayment.amount);

      expect(mockPrismaService.bonus.create).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.wallet.update).toHaveBeenCalled();
    });

    it('should handle affiliate referral', async () => {
      const mockReferral = {
        type: ReferralType.AFFILIATE,
      };
      const mockPayment = {
        amount: 10000,
      };
      const mockUser = {
        id: 'user1',
      };

      mockUsersService.findUser.mockResolvedValueOnce(mockUser);
      mockPrismaService.referral.findFirst.mockResolvedValueOnce(mockReferral);
      mockPrismaService.payment.findMany.mockResolvedValueOnce([mockPayment]);

      await service.handleReferral(mockMetadata, mockPayment.amount);

      expect(mockPrismaService.bonus.create).not.toHaveBeenCalled();
    });

    it('should handle first-time purchase with early user bonus', async () => {
      const mockReferral = {
        referrerId: 'sponsor1',
        type: ReferralType.INTERNAL,
      };
      const mockUser = {
        id: 'user1',
        firstPaymentDate: new Date(),
      };
      const mockSubscription = {
        id: 'sub1',
        expiryDate: new Date(),
      };

      mockUsersService.findUser.mockResolvedValueOnce(mockUser);
      mockPrismaService.referral.findFirst.mockResolvedValueOnce(mockReferral);
      mockPrismaService.payment.findMany.mockResolvedValueOnce([
        { amount: 10000, status: 'CAPTURED' },
      ]);
      mockUsersService.isEarlyUser.mockResolvedValueOnce(true);
      mockUsersService.isUserFirst30Days.mockResolvedValueOnce(true);
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.subscription.findFirst.mockResolvedValueOnce(
        mockSubscription,
      );
      mockPrismaService.$transaction.mockImplementationOnce(
        async (callback) => {
          const result = await callback(mockPrismaService);
          return result;
        },
      );

      await service.handleReferral(mockMetadata, 10000);

      expect(mockPrismaService.subscription.update).toHaveBeenCalled();
      expect(mockPrismaService.bonus.create).toHaveBeenCalled();
    });

    it('should not process if no referral exists', async () => {
      const mockUser = {
        id: 'user1',
      };

      mockUsersService.findUser.mockResolvedValueOnce(mockUser);
      mockPrismaService.referral.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.payment.findMany.mockResolvedValueOnce([]);

      await service.handleReferral(mockMetadata, 10000);

      expect(mockPrismaService.bonus.create).not.toHaveBeenCalled();
    });

    it('should not process if not first-time purchase', async () => {
      const mockReferral = {
        referrerId: 'sponsor1',
        type: ReferralType.INTERNAL,
      };
      const mockUser = {
        id: 'user1',
      };

      mockUsersService.findUser.mockResolvedValueOnce(mockUser);
      mockPrismaService.referral.findFirst.mockResolvedValueOnce(mockReferral);
      mockPrismaService.payment.findMany.mockResolvedValueOnce([
        { amount: 10000 },
        { amount: 20000 },
      ]);

      await service.handleReferral(mockMetadata, 10000);

      expect(mockPrismaService.bonus.create).not.toHaveBeenCalled();
    });
  });

  describe('applyFirst30DaysReferralBonus', () => {
    it('should apply 6 months free subscription for early users', async () => {
      const mockUser = {
        firstPaymentDate: new Date(),
      };
      const mockSubscription = {
        id: 'sub1',
        expiryDate: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.subscription.findFirst.mockResolvedValueOnce(
        mockSubscription,
      );
      mockPrismaService.$transaction.mockImplementationOnce(
        async (callback) => {
          const result = await callback(mockPrismaService);
          return result;
        },
      );

      await service.applyFirst30DaysReferralBonus('user1', 'order1', 1000);

      expect(mockPrismaService.subscription.update).toHaveBeenCalled();
      expect(mockPrismaService.bonus.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          amount: 0,
          type: BonusType.REFERRAL,
          category: '6 months free subscription',
          orderId: 'order1',
        },
      });
    });

    it('should throw error if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.$transaction.mockRejectedValueOnce(
        new HttpException(
          'Failed to apply referral bonus',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      await expect(
        service.applyFirst30DaysReferralBonus('user1', 'order1', 1000),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('createReferral', () => {
    it('should create internal referral with valid refCode', async () => {
      const mockReferrer = {
        id: 'referrer1',
      };

      mockPrismaService.user.findFirst.mockResolvedValueOnce(mockReferrer);

      await service.createReferral('user1', 'REF123');

      expect(mockPrismaService.referral.create).toHaveBeenCalledWith({
        data: { userId: 'user1', referrerId: 'referrer1' },
      });
    });

    it('should create affiliate referral when no internal referrer found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(null);

      await service.createReferral('user1', 'AFF123');

      expect(mockPrismaService.referral.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          affiliateId: 'AFF123',
          type: ReferralType.AFFILIATE,
        },
      });
    });
  });

  describe('getReferralInfo', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return referral information when user has referral code', async () => {
      const mockUser = {
        refCode: 'ABC123',
        userCode: 'USER-123',
        referrerId: 'referrer1',
        _count: {
          teams: 2,
        },
      };

      const mockWallet = {
        balance: 1000,
        claimed: 500,
      };

      const mockReferrer = {
        referrerId: 'referrer1',
        type: 'INTERNAL' as const,
        name: 'John Doe',
      };

      const mockClaims = [{ id: 'claim1' }];
      const mockTotalSaved = { _sum: { amount: 200 } };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);
      mockPrismaService.claim.findMany.mockResolvedValueOnce(mockClaims);
      mockPrismaService.coupon.aggregate.mockResolvedValueOnce(mockTotalSaved);
      jest.spyOn(service, 'getReferrer').mockResolvedValueOnce(mockReferrer);

      const result = await service.getReferralInfo('user1');

      expect(result).toEqual({
        referralCode: 'ABC123',
        userCode: 'USER-123',
        teams: 2,
        wallet: mockWallet,
        totalSaved: 200,
        claims: mockClaims,
        referrer: mockReferrer,
      });
    });

    it('should return undefined when user has no referral code', async () => {
      const mockUser = {
        refCode: null,
        referrerId: null,
        _count: {
          teams: 0,
        },
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await service.getReferralInfo('user1');

      expect(result).toBeUndefined();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return undefined when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.getReferralInfo('user1');

      expect(result).toBeUndefined();
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('getReferralTracking', () => {
    it('should return referral tracking information', async () => {
      const mockUser = {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockBonus = [
        {
          type: BonusType.REFERRAL,
          amount: 1000,
          referralId: 'ref1',
          createdAt: new Date('2025-05-02T08:46:10.395Z'),
          order: {
            id: 'order1',
            team: {
              name: 'Team A',
            },
          },
        },
      ];

      const mockReferral = {
        id: 'ref1',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockReferral);
      mockPrismaService.bonus.findMany.mockResolvedValueOnce(mockBonus);

      const result = await service.getReferralTracking('user1');

      expect(result).toEqual({
        user: mockUser,
        earnings: [
          {
            amount: 1000,
            referral: mockReferral,
            type: BonusType.REFERRAL,
            referralTeam: 'Team A',
            createdAt: mockBonus[0].createdAt,
          },
        ],
      });
    });

    it('should handle case when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.bonus.findMany.mockResolvedValueOnce([]);

      const result = await service.getReferralTracking('user1');

      expect(result).toEqual({
        user: null,
        earnings: [],
      });
    });
  });

  describe('createFreeTrialSubscription', () => {
    it('should create free trial subscription for early user', async () => {
      const mockUser = {
        id: 'user1',
        firstName: 'John',
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.subscription.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.bonus.findFirst.mockResolvedValueOnce(null);
      mockUsersService.isEarlyUser.mockResolvedValueOnce(true);

      await service.createFreeTrialSubscription('user1');

      expect(mockPrismaService.subscription.create).toHaveBeenCalled();
      expect(mockPrismaService.bonus.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          amount: 0,
          type: BonusType.FREE_TRIAL,
          category: '1 year free subscription',
        },
      });
    });

    it('should not create subscription if user already has one', async () => {
      const mockUser = {
        id: 'user1',
        firstName: 'John',
      };
      const mockSubscription = {
        id: 'sub1',
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.subscription.findFirst.mockResolvedValueOnce(
        mockSubscription,
      );

      await service.createFreeTrialSubscription('user1');

      expect(mockPrismaService.subscription.create).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('currency conversion', () => {
    it('should correctly convert pounds to CC', () => {
      const pounds = 100;
      const cc = service.poundsToCC(pounds);
      expect(cc).toBe(Math.round((pounds * CC_TO_POUNDS_RATE) / 10) * 10);
    });

    it('should correctly convert CC to pounds', () => {
      const cc = 10000;
      const pounds = service.ccToPounds(cc);
      expect(pounds).toBe(cc / CC_TO_POUNDS_RATE);
    });
  });
});
