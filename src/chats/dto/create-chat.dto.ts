import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    type: 'string',
    description: 'The team id',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  teamId: string;

  @ApiProperty({
    type: 'string',
    description: 'The producer id',
    required: true,
  })
  @ValidateIf((o) => o.producerId)
  @IsNotEmpty()
  @IsString()
  producerId: string;

  @ApiProperty({
    type: 'string',
    description: 'The chat text',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  text: string;
}
