import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionStatusDto {
  @ApiProperty({
    description: 'Whether the user has an active subscription',
    example: true,
  })
  hasActiveSubscription: boolean;

  @ApiProperty({
    description: 'The expiry date of the subscription if it exists',
    example: '2024-12-31T23:59:59.999Z',
    nullable: true,
  })
  expiryDate: Date | null;
} 