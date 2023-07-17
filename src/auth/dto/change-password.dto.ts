import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, ValidateIf } from 'class-validator';

export default class ChangePasswordDto {
  @ApiProperty({
    type: 'string',
    description: 'The old password of the user',
    default: '123456789',
    required: false,
  })
  @ValidateIf((o) => o.channel !== 'passwordReset')
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    type: 'string',
    description: 'The new password of the user',
    default: '987654321',
  })
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({
    type: 'string',
    description: 'The password reset token',
    default:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9rd3Vvc2FjaGlqaW9rZUBnbWFpbC5jb20iLCJpYXQiOjE2NDk5MzU2MjcsImV4cCI6MTY1MDEwODQyN30.FsCWinxvkONTvt4Lk51p9Z1AvhemTEOsAewGPvUfVPk',
    required: false,
  })
  token: string;

  @ApiProperty({
    type: 'string',
    description:
      'The source of the current password change, it can be passwordReset or settings',
    default: 'passwordReset',
  })
  @IsNotEmpty()
  channel: string;
}
