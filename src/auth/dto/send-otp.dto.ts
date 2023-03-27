import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendOTPDto {
  @ApiProperty({
    type: 'string',
    description: 'The phone number of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phone: string;
}
