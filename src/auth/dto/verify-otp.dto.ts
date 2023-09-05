import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class VerifyOTPDto {
  @ApiProperty({
    type: 'string',
    description: 'The phone number of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    type: 'string',
    description: 'The verification code sent to the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    type: 'string',
    description: 'Id returned from API when token was sent to the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  sid: string;

  @ApiProperty({
    type: 'string',
    description: 'The users firebase notification token',
    required: false,
  })
  @ValidateIf((o) => o.notificationToken)
  @IsNotEmpty()
  @IsString()
  notificationToken: string;
}
