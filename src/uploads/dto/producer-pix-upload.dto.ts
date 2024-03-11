import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ImageUploadDto } from './image-upload.dto';

export class ProducerPixUploadDto extends PartialType(ImageUploadDto) {
  @ApiProperty({
    type: 'string',
    description: 'The id of the producer',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  producerId: string;
}
