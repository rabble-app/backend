import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BillingAddressDto {
  @ApiProperty({
    description: 'The postal code of the billing address',
    example: 'SW1A 1AA',
  })
  @IsNotEmpty()
  @IsString()
  postCode: string;

  @ApiProperty({
    description: 'The first line of the billing address',
    example: '123 Main Street',
  })
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @ApiProperty({
    description: 'The second line of the billing address',
    example: 'Apt 4B',
    required: false,
  })
  @IsString()
  addressLine2?: string;

  @ApiProperty({
    description: 'The city of the billing address',
    example: 'London',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'The country of the billing address',
    example: 'United Kingdom',
  })
  @IsNotEmpty()
  @IsString()
  country: string;
} 