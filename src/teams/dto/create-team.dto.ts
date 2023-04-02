import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

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
  @IsString()
  frequency: string;

  @ApiProperty({
    type: 'string',
    description: 'The description of the buying team',
    required: false,
  })
  @ValidateIf((o) => o.description)
  @IsString()
  description: string;
}
