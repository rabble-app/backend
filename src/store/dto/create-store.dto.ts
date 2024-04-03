import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    type: 'string',
    description: 'The name of the store',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'The postal code of the store',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({
    type: 'string',
    description: 'The city of the store',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    type: 'string',
    description: 'The street address of the store',
    required: false,
  })
  @IsString()
  streetAddress: string;

  @ApiProperty({
    type: 'string',
    description: 'The direction of the store',
    required: false,
  })
  @IsString()
  direction: string;

  @ApiProperty({
    type: 'string',
    description: 'The type of the store',
    required: false,
  })
  @IsString()
  storeType: string;

  @ApiProperty({
    type: 'string',
    description: 'The shelf space of the store',
    required: false,
  })
  @IsString()
  shelfSpace: string;

  @ApiProperty({
    type: 'string',
    description: 'The dry storage space of the store',
    required: false,
  })
  @IsString()
  dryStorageSpace: string;
}
