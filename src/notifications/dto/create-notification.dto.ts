import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { notificationType } from '../../lib/types';
export class CreateNotificationDto {
  @ApiProperty({
    type: 'string',
    description: 'The order id',
    required: false,
  })
  @ValidateIf((o) => o.orderId)
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    type: 'string',
    description: 'The user id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    type: 'string',
    description: 'The team id',
    required: false,
  })
  @ValidateIf((o) => o.teamId)
  @IsNotEmpty()
  @IsString()
  teamId: string;

  @ApiProperty({
    type: 'string',
    description: 'The producer id',
    required: false,
  })
  @ValidateIf((o) => o.producerId)
  @IsNotEmpty()
  @IsString()
  producerId: string;

  @ApiProperty({
    type: 'string',
    description: 'The notification title',
    required: false,
  })
  @ValidateIf((o) => o.title)
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    type: 'string',
    description: 'The notification text',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    type: 'string',
    description: 'The notification destination',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(notificationType)
  type: notificationType;
}
