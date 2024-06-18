import { PartialType } from '@nestjs/swagger';
import { CreateOpenHoursDto } from './create-open-hours.dto';

export class UpdateOpenHoursDto extends PartialType(CreateOpenHoursDto) {}
