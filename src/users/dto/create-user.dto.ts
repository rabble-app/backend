import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    description: 'The phone number of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    type: 'string',
    description: 'The postal code of the user',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({
    type: 'string',
    description: 'The users first name',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    type: 'string',
    description: 'The users last name',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    type: 'string',
    description: 'The users email',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  email: string;
}
