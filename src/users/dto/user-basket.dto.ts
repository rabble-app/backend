import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserBasketDto {
  @ApiProperty({
    type: 'string',
    description: 'The team id of the user',
    required: true,
  })
  @IsString()
  teamId: string;
}
