import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  ValidateIf,
  IsEnum,
} from 'class-validator';
import { ProductType } from '../../../src/lib/types';

export class UpdateBasket {
  @ApiProperty({
    type: 'string',
    description: 'The basket id of the item',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  basketId: string;

  @ApiProperty({
    type: 'number',
    description: 'The new quantity of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    type: 'string',
    description: 'The new price of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    type: 'string',
    description: 'The product type',
    required: true,
  })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty({
    type: 'string',
    description: 'The id of the portion of the product',
    required: false,
  })
  @ValidateIf((o) => o.type == 'PORTIONED_SINGLE_PRODUCT')
  @IsString()
  portionId: string;

  @ApiProperty({
    type: 'number',
    description: 'The id of the portion of the product',
    required: false,
  })
  @ValidateIf((o) => o.type == 'PORTIONED_SINGLE_PRODUCT')
  @IsNumber()
  newAccumulatorValue: number;
}

export class UpdateBasketBulkDto {
  @ApiProperty({
    description: 'The contents to be updated',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBasket)
  @ArrayMinSize(1)
  basket: UpdateBasket[];

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
