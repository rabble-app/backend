import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RecentlyViewedProductDto {
  @ApiProperty({
    type: 'string',
    description: 'The id of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    type: 'string',
    description: 'The id of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  productId: string;
}
