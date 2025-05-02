import { ApiProperty } from '@nestjs/swagger';
import { SupplementTeamStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
  IsEnum,
} from 'class-validator';

export class JoinSupplementTeamDto {
  @ApiProperty({
    type: 'number',
    description: 'It holds the top up quantity',
    required: true,
  })
  @ValidateIf((o) => o.topupQuantity)
  @IsNotEmpty()
  @IsNumber()
  topupQuantity = 0;

  @ApiProperty({
    type: 'string',
    description: 'This holds the payment method id of the user',
    required: false,
  })
  @ValidateIf((o) => o.teamStatus === SupplementTeamStatus.ACTIVE)
  @IsNotEmpty()
  @IsString()
  paymentMethodId: string;

  @ApiProperty({
    type: 'string',
    description: 'This is the team id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  teamId: string;

  @ApiProperty({
    type: 'string',
    description: 'This is the status of the team',
    required: true,
  })
  @IsEnum(SupplementTeamStatus)
  teamStatus: SupplementTeamStatus;

  @ApiProperty({
    type: 'string',
    description: 'This is the user id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    type: 'string',
    description: 'This holds the base currency for the payment',
    required: true,
  })
  @ValidateIf((o) => o.teamStatus === SupplementTeamStatus.ACTIVE)
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({
    type: 'number',
    description: 'This holds the quantity',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    type: 'string',
    description: 'This holds the product id',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    type: 'string',
    description: 'This is the product id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    type: 'string',
    description: 'This holds the capsule per day',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  capsulePerDay: number;

  @ApiProperty({
    type: 'number',
    description: 'This holds the amount to charge the user',
    required: true,
  })
  @ValidateIf((o) => o.teamStatus === SupplementTeamStatus.ACTIVE)
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
