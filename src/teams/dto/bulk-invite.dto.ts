import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, IsString, IsNotEmpty } from 'class-validator';

export class BulkInviteDto {
  @ApiProperty({
    type: 'string',
    description: 'The phone content',
    required: true,
  })
  @IsArray()
  @Type(() => String)
  @ArrayMinSize(1)
  phones: string[];

  @ApiProperty({
    type: 'string',
    description: 'The id of the user who is making the invite',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    type: 'string',
    description: 'The deep link url',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  link: string;

  @ApiProperty({
    type: 'string',
    description: 'The id of the team',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  teamId: string;
}
