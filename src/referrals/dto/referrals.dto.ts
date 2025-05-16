import { BonusType } from '@prisma/client';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

export interface BonusDto {
  userId: string;
  amount: number;
  type: BonusType;
  referralId?: string;
  orderId?: string;
  category?: string;
}

export class ClaimCCDto {
  @ApiProperty({
    type: 'string',
    description: 'The user ID',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    type: 'string',
    description: 'The reward id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  rewardId: string;
}

export class CreditInfoDto {
  @ApiProperty({
    type: 'number',
    description: 'The checkout amount',
    required: true,
    example: 200,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class CreditInfoResponseDto {
  @ApiProperty({
    type: 'number',
    description: 'The available credits balance after applying credits',
    required: true,
    example: 0,
  })
  creditBalance: number;

  @ApiProperty({
    type: 'number',
    description: 'The amount left to pay after applying credits',
    required: true,
    example: 0,
  })
  amountToPay: number;

  @ApiProperty({
    type: 'number',
    description: 'The available credits before applying credits',
    example: 200,
  })
  availableCredits: number;

  @ApiProperty({
    type: 'number',
    description: 'The applicable credits',
    example: 200,
  })
  applicableCredits: number;
}

export class ApplyUserCodeDto {
  @ApiProperty({
    type: 'string',
    description: 'The user code',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userCode: string;

  @ApiProperty({
    type: 'number',
    description: 'The purchase amount',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  purchaseAmount: number;
}

export class GetApplicableBonusDto {
  @ApiProperty({
    type: 'number',
    description: 'The purchase amount',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  purchaseAmount: number;
}

export const ApplyUserCodeResponseDto: ApiResponseOptions = {
  status: 200,
  description: 'Apply a user referral code',
  schema: {
    example: {
      statusCode: 200,
      message: 'User code applied',
      data: {
        type: 'credits',
        amount: 10,
        amount_in_cc: 100,
      },
    },
    oneOf: [
      {
        example: {
          statusCode: 200,
          message: 'User code applied',
          data: {
            type: 'credits',
            amount: 10,
            amount_in_cc: 100,
          },
        },
      },
      {
        example: {
          statusCode: 200,
          message: 'User code applied',
          data: {
            type: 'free_subscription',
            duration_in_months: 6,
          },
        },
      },
    ],
  },
};

export const ReferralInfoResponseDto: ApiResponseOptions = {
  status: 200,
  description: 'Referral info',
  schema: {
    example: {
      statusCode: 200,
      message: 'Referral info',
      data: {
        referralCode: 'ABC123',
        userCode: 'USER-123',
        teams: 2,
        wallet: {
          balance: 1000,
          claimed: 500,
        },
        totalSaved: 200,
        claims: [{ id: 'claim1' }],
        referrer: {
          referrerId: 'referrer1',
          type: 'INTERNAL',
          name: 'John Doe',
        },
      },
    },
  },
};

export const ReferralTrackingResponseDto: ApiResponseOptions = {
  status: 200,
  description: 'Referral tracking',
  schema: {
    example: {
      statusCode: 200,
      message: 'Referral tracking',
      data: {
        user: {
          id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
        },
        earnings: [
          {
            amount: 1000,
            referral: {
              id: 'ref1',
              firstName: 'Jane',
              lastName: 'Smith',
            },
            type: 'REFERRAL',
            referralTeam: 'Team A',
            createdAt: '2025-05-02T08:46:10.395Z',
            category: 'Referral Bonus',
          },
        ],
      },
    },
  },
};
