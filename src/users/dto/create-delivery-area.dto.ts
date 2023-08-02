import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateIf, IsEnum } from 'class-validator';
import { DayOptions, DeliveryType } from '../../lib/types';

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
  @ValidateIf((o) => o.cutOffTime)
  @IsNotEmpty()
  @IsString()
  cutOffTime: string;

  @ApiProperty({
    type: 'string',
    description: 'The id of the producer',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  producerId: string;

  @ApiProperty({
    type: 'string',
    description: 'The custom delivery areas',
    required: false,
  })
  @ValidateIf((o) => o.customAreas)
  @IsEnum(DeliveryAreas)
  customAreas: DeliveryAreas;
}
