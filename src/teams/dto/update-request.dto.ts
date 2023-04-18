import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Status } from '../../lib/types';

export class UpdateRequestDto {
  @ApiProperty({
    type: 'string',
    description: 'The id of the request',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    type: 'string',
    description: 'PENDING | APPROVED | REJECTED | REMOVED',
    required: true,
  })
  @IsEnum(Status)
  status: Status;
}
