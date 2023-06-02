import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, ValidateIf } from 'class-validator';

export class ChargeUserDto {
  @ApiProperty({
    type: 'number',
    description: 'The amount to charge user',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    type: 'string',
    description: 'The base currency',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({
    type: 'string',
    description: 'The user stripe customer id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({
    type: 'string',
    description: 'The user stripe payment method id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  paymentMethodId: string;

  @ApiProperty({
    type: 'string',
    description: 'The team id',
    required: false,
  })
  @ValidateIf((o) => o.teamId)
  @IsNotEmpty()
  @IsString()
  teamId: string;

  @ApiProperty({
    type: 'string',
    description: 'The user id',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
