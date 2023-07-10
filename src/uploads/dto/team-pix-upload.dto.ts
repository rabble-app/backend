import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ImageUploadDto } from './image-upload.dto';

export class TeamPixUploadDto extends PartialType(ImageUploadDto) {
  @ApiProperty({
    type: 'string',
    description: 'The id of the team',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  teamId: string;
}
