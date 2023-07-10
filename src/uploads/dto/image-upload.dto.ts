import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class ImageUploadDto {
  @ApiProperty({
    type: 'string',
    description: 'The image key',
    required: false,
  })
  @ValidateIf((o) => o.imageKey)
  @IsNotEmpty()
  @IsString()
  imageKey: string;
}
