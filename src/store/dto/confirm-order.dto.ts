import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProductPayload {
  @ApiProperty({
    type: 'string',
    description: 'The product ID',
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
  quantity: number;
}

export class ConfirmOrderDto {
  @ApiProperty({
    type: 'string',
    description: 'The order ID',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    type: 'string',
    description: 'Confirmation note',
    required: false,
  })
  @IsString()
  note: string;

  @ApiProperty({
    type: [ProductPayload],
    description: 'The list of products and their quantities',
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPayload)
  products: ProductPayload[];
}

export enum OrderConfirmationStatus {
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
}
