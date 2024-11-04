import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateIf, IsEnum } from 'class-validator';
import { Channel } from '../../lib/types';

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
  @ValidateIf((o) => o.city || o.channel == Channel.SUPPLEMENT)
  @IsString()
  city: string;

  @ApiProperty({
    type: 'string',
    description: 'The postal code of the user',
    required: false,
  })
  @ValidateIf((o) => o.postalCode || o.channel == Channel.SUPPLEMENT)
  @IsString()
  postalCode: string;

  @ApiProperty({
    type: 'string',
    description: 'The app from which the user is making the request',
    required: true,
    default: Channel.CUSTOMER,
  })
  @IsEnum(Channel)
  channel: Channel = Channel.CUSTOMER;

  @ApiProperty({
    type: 'string',
    description: 'The users first name',
    required: false,
  })
  @ValidateIf((o) => o.channel == Channel.SUPPLEMENT)
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    type: 'string',
    description: 'The users last name',
    required: false,
  })
  @ValidateIf((o) => o.channel == Channel.SUPPLEMENT)
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    type: 'string',
    description: 'The city of the user',
    required: false,
  })
  @ValidateIf((o) => o.channel == Channel.SUPPLEMENT)
  @IsString()
  country: string;

  @ApiProperty({
    type: 'string',
    description: 'The phone number of the user',
    required: true,
  })
  @ValidateIf((o) => o.channel == Channel.SUPPLEMENT)
  @IsNotEmpty()
  @IsString()
  phone: string;
}
