import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export default class ResetPasswordDto {
  @ApiProperty({
    type: 'string',
    description: 'The email of the user',
    default: 'dummy1@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
