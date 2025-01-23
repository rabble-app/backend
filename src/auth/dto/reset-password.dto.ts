import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export default class ResetPasswordDto {
  @ApiProperty({
    type: 'string',
    description: 'The email of the user',
    default: 'dummy1@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'The role of the user',
    required: true,
    default: Role.PRODUCER,
  })
  @IsEnum(Role)
  role: Role = Role.PRODUCER;
}
