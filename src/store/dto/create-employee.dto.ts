import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    type: 'string',
    description: 'The first name of the employee',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    type: 'string',
    description: 'The last name of the employee',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    type: 'string',
    description: 'The employee phone number',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phone: string;
}
