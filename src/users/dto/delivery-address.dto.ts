import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class DeliveryAddressDto {
  @ApiProperty({
    type: 'string',
    description: 'The id of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    type: 'string',
    description: 'The building number',
    required: true,
  })
  @ValidateIf((o) => o.buildingNo)
  @IsString()
  buildingNo: string;

  @ApiProperty({
    type: 'string',
    description: 'The address of the user',
    required: true,
  })
  @IsString()
  address: string;

  @ApiProperty({
    type: 'string',
    description: 'The city of the user',
    required: false,
  })
  @ValidateIf((o) => o.city)
  @IsString()
  city: string;

  @ApiProperty({
    type: 'string',
    description: 'The postal code of the user',
    required: false,
  })
  @ValidateIf((o) => o.postalCode)
  @IsString()
  postalCode: string;
}
