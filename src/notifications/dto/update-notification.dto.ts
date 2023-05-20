import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { IsBoolean, IsNotEmpty, ValidateIf } from 'class-validator';
export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiProperty({
    type: 'string',
    description: 'The notification read status',
    required: false,
  })
  @ValidateIf((o) => o.isRead)
  @IsNotEmpty()
  @IsBoolean()
  isRead: boolean;
}
