import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { DayOptions } from '../../lib/types';

export class UpdateDeliveryDayInfoDto {
  @ApiProperty({
    type: 'string',
    description: 'The selected delivery days',
    required: false,
  })
  @ValidateIf((o) => o.cutOffTime)
  @IsNotEmpty()
  @IsString()
  cutOffTime: string;

  @ApiProperty({
    type: 'string',
    description: 'The  selected cut off day',
    required: false,
  })
  @ValidateIf((o) => o.cutOffDay)
  @IsEnum(DayOptions)
  cutOffDay: DayOptions;
}
