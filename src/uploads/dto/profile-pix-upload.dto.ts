import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ImageUploadDto } from './image-upload.dto';

export class ProfilePixUploadDto extends PartialType(ImageUploadDto) {
  @ApiProperty({
    type: 'string',
    description: 'The id of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
