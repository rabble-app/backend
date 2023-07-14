import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginProducerDto {
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
}
