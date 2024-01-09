import { ApiProperty } from '@nestjs/swagger';
import { ProductApprovalStatus } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class UpdateProductStatusDto {
  @ApiProperty({
    description: 'The basket content',
    required: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  products: string[];

  @ApiProperty({
    type: 'string',
    description: 'The name of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(ProductApprovalStatus)
  approvalStatus: ProductApprovalStatus;
}
