import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SubscriptionStatus } from '@prisma/client';

export class SubscriptionStatusDto {
  @ApiProperty({
    enum: SubscriptionStatus,
    description: 'The new subscription status',
  })
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;
}
