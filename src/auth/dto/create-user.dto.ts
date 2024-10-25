import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, ValidateIf } from 'class-validator';
import { Role } from '../../lib/types';

export class CreateUserDto {
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
    description: 'The role of the user',
    required: true,
    default: Role.PRODUCER,
  })
  @IsEnum(Role)
  role: Role = Role.PRODUCER;

  @ApiProperty({
    type: 'string',
    description: 'The business name of the producer',
    required: true,
  })
  @ValidateIf((o) => o.role == Role.PRODUCER)
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @ApiProperty({
    type: 'string',
    description: 'The business address of the producer',
    required: true,
  })
  @ValidateIf((o) => o.role == Role.PRODUCER)
  @IsNotEmpty()
  @IsString()
  businessAddress: string;

  @ApiProperty({
    type: 'string',
    description: 'The phone number of the producer',
    required: true,
  })
  @ValidateIf((o) => o.role == Role.PRODUCER)
  @IsNotEmpty()
  @IsString()
  phone: string;
}
