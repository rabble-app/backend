import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReturnIntentDto {
  @ApiProperty({
    type: 'string',
    description: 'The payment intent id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;
}
