import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class UpdateNotificationDto {
  @ApiProperty({
    type: 'string',
    description: 'The notification user id',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
