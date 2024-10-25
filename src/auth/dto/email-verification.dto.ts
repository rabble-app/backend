import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../lib/types';

export default class EmailVerificationDto {
  @ApiProperty({
    type: 'string',
    description: 'The email verification token',
    default:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9rd3Vvc2FjaGlqaW9rZUBnbWFpbC5jb20iLCJpYXQiOjE2NDk5MzU2MjcsImV4cCI6MTY1MDEwODQyN30.FsCWinxvkONTvt4Lk51p9Z1AvhemTEOsAewGPvUfVPk',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    type: 'string',
    description: 'The role of the user',
    required: true,
    default: Role.PRODUCER,
  })
  @IsEnum(Role)
  role: Role = Role.PRODUCER;
}
