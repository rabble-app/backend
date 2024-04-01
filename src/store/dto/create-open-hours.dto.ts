import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DayOptions, PartnerOpenHour } from '../../lib/types';
import { Type } from 'class-transformer';

class CustomOpenHoursDto {
  @ApiProperty({
    type: 'string',
    description: 'The day of the week',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(DayOptions)
  day: DayOptions;

  @ApiProperty({
    type: 'string',
    description: 'The opening time',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({
    type: 'string',
    description: 'The closing time',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  endTime: string;
}

export class CreateOpenHoursDto {
  @ApiProperty({
    type: 'string',
    description: 'The partner store id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @ApiProperty({
    type: 'string',
    description: 'The store open hour type',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(PartnerOpenHour)
  type: PartnerOpenHour;

  @ApiProperty({
    type: 'string',
    description: 'The custom open hours of the store',
    required: true,
  })
  @ValidateIf((o) => o.type != PartnerOpenHour.ALL_THE_TIME)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomOpenHoursDto)
  @ArrayMinSize(1)
  customOpenHours: CustomOpenHoursDto[];
}
