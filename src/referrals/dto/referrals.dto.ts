import { BonusType } from '@prisma/client';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
