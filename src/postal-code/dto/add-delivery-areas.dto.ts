import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { DeliveryRegionDto } from './create-delivery-days.dto';

export class CreateDeliveryAreaDto {
  @ApiProperty({
    type: 'string',
    description: 'The selected delivery day id',
    required: false,
  })
  deliveryDayId: string;

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
