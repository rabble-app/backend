import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
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
  @Transform(({ value }: TransformFnParams) => value?.replace(/ /g, ''))
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

  @ApiProperty({
    type: 'string',
    description: 'The users firebase notification token',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  notificationToken: string;
}
