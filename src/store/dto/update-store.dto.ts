import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';
import { IsString, ValidateIf } from 'class-validator';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @ApiProperty({
    type: 'string',
    description: 'The stripe connect id of the store',
    required: false,
  })
  @ValidateIf((o) => o.stripeConnectId)
  @IsString()
  stripeConnectId: string;
}
