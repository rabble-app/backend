import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    type: 'string',
    description: 'The name of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'The id of the owner of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  producerId: string;

  @ApiProperty({
    type: 'string',
    description: 'The description of the product',
    required: false,
  })
  @ValidateIf((o) => o.description)
  @IsString()
  description: string;

  @ApiProperty({
    type: 'string',
    description: 'The price of the product',
    required: false,
  })
  @IsString()
  price: string;
}
