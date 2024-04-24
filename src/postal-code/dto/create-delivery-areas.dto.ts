import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DayOptions } from '../../lib/types';

class DeliveryDayDto {
  @ApiProperty({
    type: 'string',
    description: 'The name of the selected day',
    required: false,
  })
  @IsEnum(DayOptions)
  name: DayOptions;

  @ApiProperty({
    type: 'string',
    description: 'The cut off time',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cutOffTime: string;

  @ApiProperty({
    type: 'string',
    description: 'The  selected cut off day',
    required: false,
  })
  @IsEnum(DayOptions)
  cutOffDay: DayOptions;
}

class DeliveryRegionDto {
  @ApiProperty({
    type: 'string',
    description: 'The id of the region',
    required: false,
  })
  @IsString()
  regionId: string;

  @ApiProperty({
    type: 'string',
    description: 'The minimum order',
    required: true,
  })
  @IsNotEmpty()
  @IsDecimal()
  minOrder: Decimal;

  @ApiProperty({
    type: 'string',
    description: 'The ids of the delivery areas',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryAreaDto)
  @ArrayMinSize(1)
  areas: DeliveryAreaDto[];
}

class DeliveryAreaDto {
  @ApiProperty({
    type: 'string',
    description: 'The id of the delivery area',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  areaId: string;
}

export class CreateDeliveryAreaDto {
  @ApiProperty({
    type: 'string',
    description: 'The selected delivery days',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryDayDto)
  @ArrayMinSize(1)
  days: DeliveryDayDto[];

  @ApiProperty({
    type: 'string',
    description: 'The selected delivery regions',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryRegionDto)
  @ArrayMinSize(1)
  regions: DeliveryRegionDto[];
}
