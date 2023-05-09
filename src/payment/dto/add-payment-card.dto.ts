import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AddPaymentCardDto {
  @ApiProperty({
    type: 'string',
    description: 'The card number',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cardNumber: string;

  @ApiProperty({
    type: 'number',
    description: 'The expiring month',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  expiringMonth: number;

  @ApiProperty({
    type: 'number',
    description: 'The expiring month',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  expiringYear: number;

  @ApiProperty({
    type: 'string',
    description: 'The card CVC',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cvc: string;

  @ApiProperty({
    type: 'string',
    description: 'The user phone number',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phone: string;
}
