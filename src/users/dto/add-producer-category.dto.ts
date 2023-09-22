import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class Categories {
  @ApiProperty({
    type: 'string',
    description: 'The producer id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  producerId: string;

  @ApiProperty({
    type: 'string',
    description: 'The producer category option id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  producerCategoryOptionId: string;
}

export class AddProducerCategoryDto {
  @ApiProperty({
    type: 'string',
    description: 'The producer category content',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Categories)
  @ArrayMinSize(1)
  content: Categories[];
}
