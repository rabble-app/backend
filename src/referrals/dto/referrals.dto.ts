import { BonusType } from '@prisma/client';

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface BonusDto {
  userId: string;
  amount: number;
  type: BonusType;
  referralId?: string;
  orderId?: string;
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
