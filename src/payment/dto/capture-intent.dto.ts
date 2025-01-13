import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CaptureIntentDto {
  @ApiProperty({
    type: 'string',
    description: 'The user payment intent id',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;

  @ApiProperty({
    type: 'string',
    description: 'The order id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    type: 'string',
    description: 'The team id',
    required: false,
  })
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

  @ApiProperty({
    type: 'number',
    description: 'The amount to be captured',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
