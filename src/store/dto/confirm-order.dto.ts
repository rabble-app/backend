import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
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
  @IsNotEmpty({ message: 'Order ID is required' })
  @IsString({ message: 'Order ID must be a string' })
  orderId: string;

  @ApiProperty({
    type: 'string',
    description: 'Confirmation note',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    type: [ProductPayload],
    description: 'The list of products and their quantities',
    required: true,
  })
  @Transform(({ value }) => {
    if (value) {
      return JSON.parse(value);
    }
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPayload)
  products: ProductPayload[];

  @ApiProperty({
    type: 'file',
    description: 'The order confirmation image',
    required: false,
  })
  file: Express.Multer.File;
}

export enum OrderConfirmationStatus {
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
}
