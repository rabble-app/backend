import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    type: 'string',
    description: 'The name of the buying team',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'The postal code of the buying team',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({
    type: 'string',
    description: 'The id of the producer linked to the buying team',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  producerId: string;

  @ApiProperty({
    type: 'string',
    description: 'The  user id of the person creating the buying team',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  hostId: string;

  @ApiProperty({
    type: 'string',
    description: 'The frequency of the buying team',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  frequency: number;

  @ApiProperty({
    type: 'string',
    description: 'The description of the buying team',
    required: false,
  })
  @ValidateIf((o) => o.description)
  @IsString()
  description: string;

  @ApiProperty({
    type: 'string',
    description: 'The payment intent id gotten after making payment',
    required: true,
  })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({
    type: 'boolean',
    description: 'The visibility of the buying team',
    required: false,
  })
  @ValidateIf((o) => o.isPublic)
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({
    type: 'date',
    description: 'The next delivery date of the buying team',
    required: false,
  })
  @ValidateIf((o) => o.nextDeliveryDate)
  @IsDate()
  nextDeliveryDate: Date;
}
