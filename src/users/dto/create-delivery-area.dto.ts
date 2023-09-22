import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  ValidateIf,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { DayOptions, DeliveryType } from '../../lib/types';
import { Type } from 'class-transformer';

export class DeliveryAreas {
  @ApiProperty({
    type: 'string',
    description: 'The day of delivery',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(DayOptions)
  day: DayOptions;

  @ApiProperty({
    type: 'string',
    description: 'The delivery cut off time',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cutOffTime: string;
}

export class CreateDeliveryAreaDto {
  @ApiProperty({
    type: 'string',
    description: 'The location of the delivery',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    type: 'string',
    description: 'The delivery type',
    required: true,
  })
  @IsEnum(DeliveryType)
  type: DeliveryType;

  @ApiProperty({
    type: 'string',
    description: 'The delivery cut off time',
    required: false,
  })
  @ValidateIf((o) => o.type == DeliveryType.WEEKLY)
  @IsNotEmpty()
  @IsString()
  cutOffTime: string;

  @ApiProperty({
    type: 'string',
    description: 'List of custom delivery areas',
    required: false,
  })
  @ValidateIf((o) => o.type == DeliveryType.CUSTOM)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryAreas)
  @ArrayMinSize(1)
  customAreas: DeliveryAreas[];
}
