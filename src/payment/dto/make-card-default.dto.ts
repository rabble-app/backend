import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MakeCardDefaultDto {
  @ApiProperty({
    type: 'string',
    description: 'The card last 4 digits',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  lastFourDigits: string;

  @ApiProperty({
    type: 'number',
    description: 'The user stripe customer id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({
    type: 'number',
    description: 'The payment method id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  paymentMethodId: string;
}
