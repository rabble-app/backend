import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyInviteDto {
  @ApiProperty({
    type: 'string',
    description: 'The invite token',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
