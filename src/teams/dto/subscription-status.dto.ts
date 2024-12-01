import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { SubscriptionStatus } from '../../lib/types';

export class SubscriptionStatusUpdateDto {
  @ApiProperty({
    type: 'string',
    description: 'The subscription status',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;
}
