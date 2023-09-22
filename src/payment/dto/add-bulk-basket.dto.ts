import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsString,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class AddToBasket {
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
}

export class AddBulkBasketDto {
  @ApiProperty({
    description: 'The basket content',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddToBasket)
  @ArrayMinSize(1)
  basket: AddToBasket[];

  @ApiProperty({
    type: 'string',
    description: 'The buying team id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  teamId: string;
}
