import { Test, TestingModule } from '@nestjs/testing';
import { ReferralsService } from './referrals.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { HttpException } from '@nestjs/common';
import Stripe from 'stripe';
import {
  CC_TO_POUNDS_RATE,
  MINIMUM_STRIPE_AMOUNT_IN_PENCE,
} from '../utils/constants';

describe('ReferralsService', () => {
  let service: ReferralsService;
  let mockLogger: any;
  let mockRollbar: any;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
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
    },
    $transaction: jest.fn(),
  };

  const mockUsersService = {
    updateUser: jest.fn(),
  };

  beforeEach(async () => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
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
          useValue: { STRIPE_SECRET_KEY: 'test_key' },
        },
      ],
    }).compile();

    service = module.get<ReferralsService>(ReferralsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('claimRewards', () => {
    it('should throw error if wallet does not exist', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.claimRewards({ userId: 'user1', rewardId: 'reward1' }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if insufficient funds', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce({
        balance: 500,
      });
      mockPrismaService.reward.findUnique.mockResolvedValueOnce({
        amount: 50000,
        rate: 10000,
        id: 'reward1',
      });

      await expect(
        service.claimRewards({ userId: 'user1', rewardId: 'reward1' }),
      ).rejects.toThrow(HttpException);
    });

    it('should update wallet balance on successful claim', async () => {
      const mockWallet = {
        balance: 50000,
        claimed: 0,
      };
      mockPrismaService.wallet.findUnique.mockResolvedValueOnce(mockWallet);
      mockPrismaService.$transaction.mockResolvedValueOnce([
        {
          ...mockWallet,
          balance: 0,
          claimed: 50000,
          availableCredits: 10,
        },
        {
          id: 'claim1',
          userId: 'user1',
          amount: 50000,
          rewardId: 'reward1',
        },
      ]);
      mockPrismaService.reward.findUnique.mockResolvedValueOnce({
        amount: 50000,
        rate: 10000,
        id: 'reward1',
      });
      mockPrismaService.wallet.update.mockResolvedValueOnce({
        ...mockWallet,
        balance: 0,
        claimed: 50000,
        availableCredits: 10,
      });

      await service.claimRewards({ userId: 'user1', rewardId: 'reward1' });

      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        data: {
          balance: { decrement: 50000 },
          claimed: { increment: 50000 },
          availableCredits: { increment: 5 },
        },
      });
    });
  });

  describe('Available credits', () => {
    it('available credits should cover the capture amount', async () => {
      jest.spyOn(service, 'getAvailableCredits').mockResolvedValueOnce(100);
      const result = await service.getApplicableCredits('user1', 100);
      expect(result).toEqual({
        creditBalance: 0,
        applicableCredits: 100,
        amountToPay: 0,
        availableCredits: 100,
      });
    });

    it('available credits should partially   cover the capture amount', async () => {
      jest.spyOn(service, 'getAvailableCredits').mockResolvedValueOnce(100);
      const result = await service.getApplicableCredits('user1', 200);
      expect(result).toEqual({
        creditBalance: 0,
        applicableCredits: 100,
        amountToPay: 100,
        availableCredits: 100,
      });
    });

    it('should apply only possible available credits', async () => {
      const availableCredits = 100;
      jest
        .spyOn(service, 'getAvailableCredits')
        .mockResolvedValueOnce(availableCredits);
      const captureAmount = 100.8;
      const result = await service.getApplicableCredits('user1', captureAmount);
      expect(result).toEqual({
        creditBalance: MINIMUM_STRIPE_AMOUNT_IN_PENCE / 100,
        applicableCredits:
          availableCredits - MINIMUM_STRIPE_AMOUNT_IN_PENCE / 100,
        amountToPay:
          (captureAmount * 100 -
            availableCredits * 100 +
            MINIMUM_STRIPE_AMOUNT_IN_PENCE) /
          100,
        availableCredits,
      });
    });
    it('should not apply if the available credits are less than the minimum applicable amount', async () => {
      const availableCredits = 4;
      jest
        .spyOn(service, 'getAvailableCredits')
        .mockResolvedValueOnce(availableCredits);
      const captureAmount = 100.8;
      const result = await service.getApplicableCredits('user1', captureAmount);
      expect(result).toEqual({
        creditBalance: availableCredits,
        applicableCredits: 0,
        amountToPay: captureAmount,
        availableCredits,
      });
    });
  });

  describe('handleReferral', () => {
    const mockMetadata: Stripe.Metadata = {
      order_id: 'order1',
      user_id: 'user1',
    };

    it('should handle first-time purchase with referral', async () => {
      const mockUser = {
        id: 'user1',
        referrerId: 'sponsor1',
      };

      const mockSponsor = {
        id: 'sponsor1',
      };

      const mockPayment = {
        amount: 10000, // £100 in pence
      };

      mockPrismaService.user.findUnique.mockImplementation((params) => {
        if (params.where.id === 'user1') {
          return Promise.resolve(mockUser);
        }
        if (params.where.id === 'sponsor1') {
          return Promise.resolve(mockSponsor);
        }
        return Promise.resolve(null);
      });
      mockPrismaService.payment.findMany.mockResolvedValueOnce([mockPayment]);

      await service.handleReferral(mockMetadata, mockPayment.amount);

      expect(mockUsersService.updateUser).toHaveBeenCalled();
      expect(mockPrismaService.bonus.create).toHaveBeenCalledTimes(2); // One for signup, one for referral
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
