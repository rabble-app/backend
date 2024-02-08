import { PartialType } from '@nestjs/swagger';
import { DeliveryAddressDto } from './delivery-address.dto';

export class UpdateDeliveryAddressDto extends PartialType(DeliveryAddressDto) {}
