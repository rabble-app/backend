import { PartialType } from '@nestjs/swagger';
import { AddToBasket } from './add-bulk-basket.dto';

export class UpdateBasketItemDto extends PartialType(AddToBasket) {}
