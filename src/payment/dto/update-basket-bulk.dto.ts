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
}

export class UpdateBasketBulkDto {
  @ApiProperty({
    type: 'string',
    description: 'The contents to be updated',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBasket)
  @ArrayMinSize(1)
  basket: UpdateBasket[];
}
