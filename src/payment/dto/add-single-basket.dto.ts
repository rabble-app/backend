import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  ValidateIf,
} from 'class-validator';

export class AddSingleBasketDto {
  @ApiProperty({
    type: 'string',
    description: 'The team id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  teamId: string;

  @ApiProperty({
    type: 'string',
    description: 'The user id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    type: 'string',
    description: 'The product id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    type: 'number',
    description: 'The quantity of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    type: 'string',
    description: 'The product id',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    type: 'string',
    description: 'The order id',
    required: true,
  })
  @ValidateIf((o) => o.deadlineReached != true)
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    type: 'boolean',
    description: 'indicates whether order deadline has been reached',
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  deadlineReached: boolean;
}
