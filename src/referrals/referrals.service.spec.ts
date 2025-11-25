import { Test, TestingModule } from '@nestjs/testing';
import { ReferralsService } from './referrals.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { StripeService } from '../stripe/stripe.service';
import { HttpException } from '@nestjs/common';
import Stripe from 'stripe';

import { BonusType, ReferralType, AffiliateRewardType } from '@prisma/client';
import { CourierService } from '../notifications/courier.service';

describe('ReferralsService', () => {
  let service: ReferralsService;
  let mockPrismaService: any;
  let mockUsersService: any;
  let mockLogger: any;
  let mockRollbar: any;
  let mockStripeService: any;
  let mockCourierService: any;

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      referral: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      subscription: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      payment: {
        findMany: jest.fn(),
      },
      wallet: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      bonus: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      claim: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      coupon: {
        aggregate: jest.fn(),
        create: jest.fn(),
      },
      reward: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      affiliate: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    mockUsersService = {
      findOne: jest.fn(),
      findUser: jest.fn(),
      isEarlyUser: jest.fn(),
      isUserFirst30Days: jest.fn(),
    };

    mockStripeService = {
      getStripe: jest.fn(),
      createPaymentIntent: jest.fn(),
      createCustomer: jest.fn(),
      createSubscription: jest.fn(),
      createCoupon: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    mockRollbar = {
      error: jest.fn(),
      info: jest.fn(),
    };

    mockCourierService = {
      sendCoinEarnedMail: jest.fn(),
      sendReferralFreeMonthMail: jest.fn(),
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
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: CourierService,
          useValue: mockCourierService,
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
          useValue: {
            SUPPLEMENT_STRIPE_SECRET_KEY: 'test_key',
            SUPPLEMENT_EMAIL_URL: 'https://test.com',
          },
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
      mockUsersService.isEarlyUser.mockImplementationOnce(() => ({
        isEarly: true,
        count: 0,
      }));
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
        id: 'mock-id',
        userId: 'user1',
        referrerId: 'sponsor1',
        type: ReferralType.INTERNAL,
        affiliateId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockUser = {
        id: 'user1',
        firstPaymentDate: new Date(),
      };
      const mockSponsor = {
        id: 'sponsor1',
        firstPaymentDate: new Date(),
      };
      const mockSubscription = {
        id: 'sub1',
        expiryDate: new Date(),
      };

      // Mock all the necessary service calls
      mockUsersService.findUser
        .mockResolvedValueOnce(mockUser) // First call for user
        .mockResolvedValueOnce(mockSponsor); // Second call for sponsor
      mockPrismaService.referral.findFirst.mockResolvedValueOnce(mockReferral);
      jest.spyOn(service, 'getFirstTimePurchase').mockResolvedValueOnce(10000); // Should return the amount
      mockPrismaService.payment.findMany.mockResolvedValueOnce([
        { amount: 10000, status: 'CAPTURED' },
      ]);
      mockUsersService.isEarlyUser.mockImplementationOnce(() => ({
        isEarly: true,
        count: 0,
      }));
      mockUsersService.isUserFirst30Days.mockResolvedValueOnce(true);
      jest.spyOn(service, 'countReferrals').mockResolvedValueOnce(3);
      jest
        .spyOn(service, 'checkFreeSubscriptionDuration')
        .mockResolvedValueOnce(1);
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockSponsor) // For checkFreeSubscriptionDuration
        .mockResolvedValueOnce({ firstPaymentDate: new Date() }); // For applyFirst30DaysReferralBonus
      mockPrismaService.subscription.findUnique.mockResolvedValueOnce(
        mockSubscription,
      );
      mockPrismaService.subscription.findFirst.mockResolvedValueOnce(
        mockSubscription,
      ); // For applyFirst30DaysReferralBonus
      mockPrismaService.referral.count.mockResolvedValueOnce(3);

      // Create mocks for the transaction
      const txSubscriptionUpdateMock = jest
        .fn()
        .mockResolvedValueOnce(mockSubscription);
      const txBonusCreateMock = jest
        .fn()
        .mockResolvedValueOnce({ id: 'bonus1' });

      // Mock the transaction to properly execute the callback
      mockPrismaService.$transaction.mockImplementationOnce(
        async (callback) => {
          const txMock = {
            user: {
              findUnique: jest
                .fn()
                .mockResolvedValueOnce({ firstPaymentDate: new Date() }),
            },
            subscription: {
              findFirst: jest.fn().mockResolvedValueOnce(mockSubscription),
              update: txSubscriptionUpdateMock,
            },
            bonus: {
              create: txBonusCreateMock,
            },
          };
          return callback(txMock);
        },
      );

      await service.handleReferral(mockMetadata, 10000);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(txSubscriptionUpdateMock).toHaveBeenCalledWith({
        where: { id: mockSubscription.id },
        data: {
          expiryDate: expect.any(Date),
        },
      });
      expect(txBonusCreateMock).toHaveBeenCalledWith({
        data: {
          userId: 'sponsor1',
          amount: 0,
          type: BonusType.REFERRAL,
          category: '6 months free subscription',
          orderId: 'order1',
          referralId: 'user1',
        },
      });
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
      const mockAffiliate = { id: 'aff1', code: 'AFF123' };
      mockPrismaService.user.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.affiliate.findUnique.mockResolvedValueOnce(
        mockAffiliate,
      );

      await service.createReferral('user1', 'AFF123');

      expect(mockPrismaService.referral.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          affiliateId: 'aff1',
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
      const mockBonuses = [
        { category: '1 year free subscription' },
        { category: '6 months free subscription' },
      ];

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);
      mockPrismaService.claim.findMany.mockResolvedValueOnce(mockClaims);
      mockPrismaService.coupon.aggregate.mockResolvedValueOnce(mockTotalSaved);
      mockPrismaService.bonus.findMany.mockResolvedValueOnce(mockBonuses);
      jest.spyOn(service, 'getReferrer').mockResolvedValueOnce(mockReferrer);

      const result = await service.getReferralInfo('user1');

      expect(result).toEqual({
        referralCode: 'ABC123',
        userCode: 'USER-123',
        teams: 2,
        wallet: mockWallet,
        totalSaved: 200,
        claims: mockClaims,
        freeMonthsReceived: 18,
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
      expect(mockPrismaService.bonus.findMany).not.toHaveBeenCalled();
    });

    it('should return undefined when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.getReferralInfo('user1');

      expect(result).toBeUndefined();
      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockPrismaService.bonus.findMany).not.toHaveBeenCalled();
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
      mockUsersService.isEarlyUser.mockImplementationOnce(() => ({
        isEarly: true,
        count: 0,
      }));
      mockPrismaService.$transaction.mockImplementationOnce(
        async (callback) => {
          const result = await callback(mockPrismaService);
          return result;
        },
      );

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

      mockUsersService.isEarlyUser.mockResolvedValueOnce({
        isEarly: true,
        availableSlots: 50,
      });
      mockPrismaService.subscription.findUnique.mockResolvedValueOnce(
        mockSubscription,
      );

      await service.createFreeTrialSubscription('user1');

      expect(mockPrismaService.subscription.create).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('getFirstTimePurchase', () => {
    it('should return the amount if user has no previous payments', async () => {
      mockPrismaService.payment.findMany.mockResolvedValueOnce([]);
      const result = await service.getFirstTimePurchase('user1', {}, 12345);
      expect(result).toBe(12345);
    });
    it('should return the payment amount if user has one payment', async () => {
      mockPrismaService.payment.findMany.mockResolvedValueOnce([
        { amount: 5000 },
      ]);
      const result = await service.getFirstTimePurchase('user1', {}, 12345);
      expect(result).toBe(5000);
    });
    it('should return false if user has more than one payment', async () => {
      mockPrismaService.payment.findMany.mockResolvedValueOnce([
        { amount: 5000 },
        { amount: 6000 },
      ]);
      const result = await service.getFirstTimePurchase('user1', {}, 12345);
      expect(result).toBe(false);
    });
  });

  describe('claimRewards', () => {
    it('should successfully claim rewards', async () => {
      const mockWallet = {
        userId: 'user1',
        balance: 1000,
        claimed: 0,
        availableCredits: 0,
      };
      const mockReward = {
        id: 'reward1',
        amount: 500,
        rate: 10,
      };
      const mockUpdatedWallet = {
        ...mockWallet,
        balance: 500,
        claimed: 500,
        availableCredits: 50,
      };

      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);
      mockPrismaService.reward.findUnique.mockResolvedValueOnce(mockReward);
      mockPrismaService.$transaction.mockResolvedValueOnce([
        mockUpdatedWallet,
        { id: 'claim1' },
      ]);

      const result = await service.claimRewards({
        userId: 'user1',
        rewardId: 'reward1',
      });

      expect(result).toEqual(mockUpdatedWallet);
      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: {
          balance: { decrement: 500 },
          claimed: { increment: 500 },
          availableCredits: { increment: 50 },
        },
      });
    });

    it('should throw error if user has no wallet', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.claimRewards({ userId: 'user1', rewardId: 'reward1' }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if reward not found', async () => {
      const mockWallet = { balance: 1000 };
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);
      mockPrismaService.reward.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.claimRewards({ userId: 'user1', rewardId: 'reward1' }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if insufficient balance', async () => {
      const mockWallet = { balance: 100 };
      const mockReward = { amount: 500, rate: 10 };
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);
      mockPrismaService.reward.findUnique.mockResolvedValueOnce(mockReward);

      await expect(
        service.claimRewards({ userId: 'user1', rewardId: 'reward1' }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('applyCoupon', () => {
    it('should apply coupon when sufficient credits available', async () => {
      const mockCoupon = { id: 'coupon1' };
      mockStripeService.createCoupon.mockResolvedValueOnce(mockCoupon);
      mockPrismaService.wallet.update.mockResolvedValueOnce({});

      // Mock the getAvailableCreditInfo method
      jest.spyOn(service, 'getAvailableCreditInfo').mockResolvedValueOnce({
        creditBalance: 0,
        couponValue: 1000,
        remainingAmount: 4000,
        fullCoverage: false,
        availableCredits: 1000,
      });

      const result = await service.applyCoupon('user1', 5000); // £50 in pence

      expect(result).toHaveProperty('couponId', 'coupon1');
      expect(result).toHaveProperty('amountOff');
      expect(result).toHaveProperty('fullCouponCoverage');
    });

    it('should return default result when insufficient credits', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce({
        availableCredits: 0.01, // Less than minimum
      });

      const result = await service.applyCoupon('user1', 5000);

      expect(result).toEqual({
        amount: 5000,
        couponId: null,
        amountOff: 0,
        fullCouponCoverage: false,
      });
    });
  });

  describe('getApplicableBonus', () => {
    const mockReferral = {
      id: 'mock-id',
      userId: 'mock-user',
      referrerId: 'ref1',
      type: ReferralType.INTERNAL,
      affiliateId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    it('should return null if no referral exists', async () => {
      jest.spyOn(service, 'getReferral').mockResolvedValueOnce(null);
      const result = await service.getApplicableBonus('user1', 10000);
      expect(result).toBeNull();
    });
    it('should return null if referrer has no firstPaymentDate', async () => {
      jest.spyOn(service, 'getReferral').mockResolvedValueOnce(mockReferral);
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      const result = await service.getApplicableBonus('user1', 10000);
      expect(result).toBeNull();
    });
    it('should return free_subscription if early user, first 30 days, <=3 referrals, <2 years', async () => {
      jest.spyOn(service, 'getReferral').mockResolvedValueOnce(mockReferral);
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        firstPaymentDate: new Date(),
      });
      jest.spyOn(service, 'countReferrals').mockResolvedValueOnce(2);
      jest
        .spyOn(service, 'checkFreeSubscriptionDuration')
        .mockResolvedValueOnce(1);
      mockUsersService.isEarlyUser.mockImplementationOnce(() => ({
        isEarly: true,
        count: 0,
      }));
      mockUsersService.isUserFirst30Days.mockResolvedValueOnce(true);
      const result = await service.getApplicableBonus('user1', 10000);
      expect(result).toEqual({
        type: 'free_subscription',
        duration_in_months: 12,
      });
    });
    it('should return credits if not early user or not first 30 days', async () => {
      jest.spyOn(service, 'getReferral').mockResolvedValueOnce(mockReferral);
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        firstPaymentDate: new Date(),
      });
      jest.spyOn(service, 'countReferrals').mockResolvedValueOnce(4);
      jest
        .spyOn(service, 'checkFreeSubscriptionDuration')
        .mockResolvedValueOnce(3);
      mockUsersService.isEarlyUser.mockImplementationOnce(() => ({
        isEarly: true,
        count: 0,
      }));
      mockUsersService.isUserFirst30Days.mockResolvedValueOnce(false);
      const result = await service.getApplicableBonus('user1', 10000);
      expect(result).toHaveProperty('type', 'credits');
      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('amount_in_cc');
    });
  });

  describe('applyUserCode', () => {
    it('should throw if not first time purchase', async () => {
      jest.spyOn(service, 'isFirstTimePurchase').mockResolvedValueOnce(false);
      await expect(
        service.applyUserCode('user1', 'CODE-123', 10000),
      ).rejects.toThrow('User has previously made a purchase');
    });
    it('should throw error if user code is invalid', async () => {
      jest.spyOn(service, 'isFirstTimePurchase').mockResolvedValueOnce(true);
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.affiliate.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.applyUserCode('user1', 'CODE-123', 10000),
      ).rejects.toThrow('Invalid code');
    });
    it('should create referral and return applicable bonus', async () => {
      jest.spyOn(service, 'isFirstTimePurchase').mockResolvedValueOnce(true);
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'referrer1',
      });
      jest.spyOn(service, 'getApplicableBonus').mockResolvedValueOnce({
        type: 'credits',
        amount: 100,
        amount_in_cc: 1000,
      });
      mockPrismaService.referral.create.mockResolvedValueOnce({});
      const result = await service.applyUserCode('user1', 'CODE-123', 10000);
      expect(mockPrismaService.referral.create).toHaveBeenCalledWith({
        data: { userId: 'user1', referrerId: 'referrer1' },
      });
      expect(result).toEqual({
        type: 'credits',
        amount: 100,
        amount_in_cc: 1000,
      });
    });
  });

  describe('affiliate functionality', () => {
    describe('getAffiliate', () => {
      it('should return affiliate by code', async () => {
        const mockAffiliate = {
          id: 'aff1',
          code: 'AFF123',
          rewardType: AffiliateRewardType.CREDIT,
          rewardAmount: 10,
        };
        mockPrismaService.affiliate.findUnique.mockResolvedValueOnce(
          mockAffiliate,
        );

        const result = await service.getAffiliateById('aff1');

        expect(result).toEqual(mockAffiliate);
      });

      it('should return null if affiliate not found', async () => {
        mockPrismaService.affiliate.findUnique.mockResolvedValueOnce(null);

        const result = await service.getAffiliate('INVALID');

        expect(result).toBeNull();
      });
    });

    describe('applyAffiliateCode', () => {
      it('should return credit bonus for affiliate code', async () => {
        const mockAffiliate = {
          id: 'aff1',
          code: 'AFF123',
          rewardType: AffiliateRewardType.CREDIT,
          rewardAmount: 10,
        };
        mockPrismaService.affiliate.findUnique.mockResolvedValueOnce(
          mockAffiliate,
        );

        const result = await service.applyAffiliateCode(
          'user1',
          'AFF123',
          10000,
        );

        expect(result).toEqual({
          type: 'credits',
          amount: 1000, // 10% of 10000
          amount_in_cc: expect.any(Number),
        });
      });

      it('should throw error for invalid affiliate code', async () => {
        mockPrismaService.affiliate.findUnique.mockResolvedValueOnce(null);

        await expect(
          service.applyAffiliateCode('user1', 'INVALID', 10000),
        ).rejects.toThrow(HttpException);
      });
    });

    describe('applyAffiliateBonus', () => {
      it('should apply credit bonus for affiliate', async () => {
        const mockAffiliate = {
          id: 'aff1',
          code: 'AFF123',
          rewardType: AffiliateRewardType.CREDIT,
          rewardAmount: 10,
        };
        mockPrismaService.affiliate.findUnique.mockResolvedValueOnce(
          mockAffiliate,
        );
        mockPrismaService.bonus.create.mockResolvedValueOnce({});
        mockPrismaService.wallet.findUnique.mockResolvedValueOnce({});
        mockPrismaService.wallet.update.mockResolvedValueOnce({});

        await service.applyAffiliateBonus({
          userId: 'user1',
          affiliateId: 'AFF123',
          purchaseAmount: 10000,
          orderId: 'order1',
        });

        expect(mockPrismaService.bonus.create).toHaveBeenCalledWith({
          data: {
            userId: 'user1',
            amount: 10000000, // 10% of 10000 = 1000, converted to CC
            type: BonusType.AFFILIATE_REFERRAL,
            orderId: 'order1',
          },
        });
      });

      it('should apply free month bonus for affiliate', async () => {
        const mockAffiliate = {
          id: 'aff1',
          code: 'AFF123',
          rewardType: AffiliateRewardType.FREE_MONTH,
          rewardAmount: 3,
        };
        mockPrismaService.affiliate.findUnique.mockResolvedValueOnce(
          mockAffiliate,
        );
        mockPrismaService.user.findUnique.mockResolvedValueOnce({
          firstPaymentDate: new Date(),
        });
        mockPrismaService.subscription.findFirst.mockResolvedValueOnce({
          id: 'sub1',
          expiryDate: new Date(),
        });
        mockPrismaService.$transaction.mockImplementationOnce(
          async (callback) => {
            const txMock = {
              user: {
                findUnique: jest
                  .fn()
                  .mockResolvedValueOnce({ firstPaymentDate: new Date() }),
              },
              subscription: {
                findFirst: jest.fn().mockResolvedValueOnce({
                  id: 'sub1',
                  expiryDate: new Date(),
                }),
                update: jest.fn(),
              },
              bonus: {
                create: jest.fn(),
              },
            };
            return callback(txMock);
          },
        );

        await service.applyAffiliateBonus({
          userId: 'user1',
          affiliateId: 'AFF123',
          purchaseAmount: 10000,
          orderId: 'order1',
        });

        expect(mockPrismaService.$transaction).toHaveBeenCalled();
      });
    });
  });

  describe('handleRefCodeAndFreeTrial', () => {
    it('should generate referral codes and create free trial', async () => {
      const mockUser = {
        refCode: null,
        userCode: null,
        firstName: 'John',
      };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.user.update.mockResolvedValueOnce({});
      mockPrismaService.subscription.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.bonus.findFirst.mockResolvedValueOnce(null);
      mockUsersService.isEarlyUser.mockImplementationOnce(() => ({
        isEarly: true,
        count: 0,
      }));
      mockPrismaService.subscription.create.mockResolvedValueOnce({});
      mockPrismaService.bonus.create.mockResolvedValueOnce({});

      await service.handleRefCodeAndFreeTrial('user1');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: {
          refCode: expect.any(String),
          userCode: expect.stringMatching(/^JOHN-[A-Z0-9]{3}$/),
        },
      });
    });

    it('should not generate codes if user already has them', async () => {
      const mockUser = {
        refCode: 'EXISTING',
        userCode: 'EXISTING-123',
        firstName: 'John',
      };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      await service.handleRefCodeAndFreeTrial('user1');

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('email functionality', () => {
    describe('sendCoinEarnedEmail', () => {
      it('should send coin earned email successfully', async () => {
        const mockSponsor = {
          id: 'sponsor1',
          email: 'sponsor@test.com',
          firstName: 'John',
          refCode: 'REF123',
          userCode: 'JOHN-123',
        };
        const mockWallet = { balance: 1000 };
        mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);
        mockCourierService.sendCoinEarnedMail.mockResolvedValueOnce({});

        await service['sendCoinEarnedEmail'](mockSponsor, 500);

        expect(mockCourierService.sendCoinEarnedMail).toHaveBeenCalledWith(
          'sponsor@test.com',
          'John',
          expect.stringContaining('REF123'),
          'JOHN-123',
          500,
          1000,
          expect.any(Number),
          expect.stringContaining('/dashboard'),
        );
      });

      it('should handle email sending error gracefully', async () => {
        const mockSponsor = {
          id: 'sponsor1',
          email: 'sponsor@test.com',
          firstName: 'John',
          refCode: 'REF123',
          userCode: 'JOHN-123',
        };
        const mockWallet = { balance: 1000 };
        mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);
        mockCourierService.sendCoinEarnedMail.mockRejectedValueOnce(
          new Error('Email error'),
        );

        // Should not throw error
        await expect(
          service['sendCoinEarnedEmail'](mockSponsor, 500),
        ).resolves.not.toThrow();

        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe('sendReferralFreeMonthEmail', () => {
      it('should send referral free month email successfully', async () => {
        const mockUser = {
          id: 'user1',
          email: 'user@test.com',
          firstName: 'Jane',
          refCode: 'REF456',
          userCode: 'JANE-456',
          firstPaymentDate: new Date('2025-01-01'),
        };
        mockCourierService.sendReferralFreeMonthMail.mockResolvedValueOnce({});

        await service['sendReferralFreeMonthEmail'](mockUser);

        expect(
          mockCourierService.sendReferralFreeMonthMail,
        ).toHaveBeenCalledWith(
          'user@test.com',
          'Jane',
          expect.any(String),
          'JANE-456',
          expect.stringContaining('REF456'),
          expect.stringContaining('/dashboard'),
        );
      });

      it('should handle email sending error gracefully', async () => {
        const mockUser = {
          id: 'user1',
          email: 'user@test.com',
          firstName: 'Jane',
          refCode: 'REF456',
          userCode: 'JANE-456',
          firstPaymentDate: new Date('2025-01-01'),
        };
        mockCourierService.sendReferralFreeMonthMail.mockRejectedValueOnce(
          new Error('Email error'),
        );

        // Should not throw error
        await expect(
          service['sendReferralFreeMonthEmail'](mockUser),
        ).resolves.not.toThrow();

        expect(mockLogger.error).toHaveBeenCalled();
      });
    });
  });
});
