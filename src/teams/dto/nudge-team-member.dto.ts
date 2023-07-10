import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NudgeTeamMemberDto {
  @ApiProperty({
    type: 'string',
    description: 'The name of the buying team',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  teamName: string;

  @ApiProperty({
    type: 'string',
    description: 'The phone number of the recipient',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  memberPhone: string;
}
