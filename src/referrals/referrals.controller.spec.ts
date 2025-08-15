import { Test, TestingModule } from '@nestjs/testing';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

describe('ReferralsController', () => {
  let controller: ReferralsController;
  let service: ReferralsService;

  const mockReferralsService = {
    claimRewards: jest.fn(),
    getReferralInfo: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockRollbar = {
    error: jest.fn(),
    info: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferralsController],
      providers: [
        {
          provide: ReferralsService,
          useValue: mockReferralsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: 'AWS_PARAMETERS',
          useValue: {
            JWT_SECRET: 'test-secret',
          },
        },
        {
          provide: 'ROLLBAR',
          useValue: mockRollbar,
        },
      ],
    }).compile();

    controller = module.get<ReferralsController>(ReferralsController);
    service = module.get<ReferralsService>(ReferralsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('claims', () => {
    const mockPayload = {
      userId: '123',
      rewardId: 'reward1',
    };

    const mockRequest = {
      user: {
        id: '123',
      },
    };

    it('should successfully claim rewards', async () => {
      mockReferralsService.claimRewards.mockResolvedValue({ success: true });

      const result = await controller.claims(
        mockPayload,
        mockResponse,
        mockRequest,
      );

      expect(service.claimRewards).toHaveBeenCalledWith({
        userId: '123',
        rewardId: 'reward1',
      });
      expect(result.data).toEqual({ success: true });
    });

    it('should throw unauthorized when userId does not match', async () => {
      const invalidRequest = {
        user: {
          id: '456', // Different user ID
        },
      };

      await expect(
        controller.claims(mockPayload, mockResponse, invalidRequest),
      ).rejects.toThrow(HttpException);
    });

    it('should throw bad request when claim fails', async () => {
      mockReferralsService.claimRewards.mockResolvedValue(null);

      await expect(
        controller.claims(mockPayload, mockResponse, mockRequest),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('info', () => {
    const mockRequest = {
      user: {
        id: '123',
      },
    };

    it('should successfully get referral info', async () => {
      const mockReferralInfo = {
        referralCode: '123',
        teams: 5,
        wallet: {
          balance: 10000,
        },
        bonuses: [],
        totalSaved: 10000,
        claims: [],
      };

      mockReferralsService.getReferralInfo.mockResolvedValue(mockReferralInfo);

      const result = await controller.info(mockRequest, mockResponse);

      expect(service.getReferralInfo).toHaveBeenCalledWith('123');
      expect(result.data).toEqual(mockReferralInfo);
      expect(result.message).toBe('Referral info');
    });
  });
});
