import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddPaymentCardDto {
  @ApiProperty({
    type: 'string',
    description: 'The payment method id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  paymentMethodId: string;

  @ApiProperty({
    type: 'string',
    description: 'The user stripe customer id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  stripeCustomerId: string;
}
