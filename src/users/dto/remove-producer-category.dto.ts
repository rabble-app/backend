import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveProducerCategoryDto {
  @ApiProperty({
    type: 'string',
    description: 'The producer category id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  producerCategoryId: string;
}
