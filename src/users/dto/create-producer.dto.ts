import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateIf, IsNumber } from 'class-validator';
export class CreateProducerDto {
  @ApiProperty({
    type: 'string',
    description: 'The id of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    type: 'string',
    description: 'The business name of the producer',
    required: true,
  })
  @IsString()
  businessName: string;

  @ApiProperty({
    type: 'string',
    description: 'The business address of the producer',
    required: true,
  })
  @IsString()
  businessAddress: string;

  @ApiProperty({
    type: 'string',
    description: 'The business website of the producer',
    required: false,
  })
  @ValidateIf((o) => o.website)
  @IsString()
  website: string;

  @ApiProperty({
    type: 'string',
    description: 'The business description of the producer',
    required: false,
  })
  @ValidateIf((o) => o.description)
  @IsString()
  description: string;

  @ApiProperty({
    type: 'number',
    description: 'The minimum treshold for the producer',
    required: true,
  })
  @IsNumber()
  minimumTreshold: number;

  @ApiProperty({
    type: 'string',
    description: 'The business sales email',
    required: false,
  })
  @ValidateIf((o) => o.salesEmail)
  @IsString()
  salesEmail: string;

  @ApiProperty({
    type: 'string',
    description: 'The business account email',
    required: false,
  })
  @ValidateIf((o) => o.accountsEmail)
  @IsString()
  accountsEmail: string;
}
