import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProducerDto {
  @ApiProperty({
    type: 'string',
    description: 'The email of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'The password of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    type: 'string',
    description: 'The business name of the producer',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @ApiProperty({
    type: 'string',
    description: 'The business address of the producer',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  businessAddress: string;

  @ApiProperty({
    type: 'string',
    description: 'The phone number of the producer',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phone: string;
}
