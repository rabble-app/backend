import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PusherChannelAuthDto {
  @ApiProperty({
    type: 'string',
    description: 'The socket id of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  socket_id: string;

  @ApiProperty({
    type: 'string',
    description: 'The channel name the user wants to join',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  channel_name: string;
}
