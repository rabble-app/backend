import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PusherUserAuthDto {
  @ApiProperty({
    type: 'string',
    description: 'The socket id of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  socket_id: string;
}
