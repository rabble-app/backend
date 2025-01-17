import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CaptureIntentDto } from './capture-intent.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TopUpDto extends PartialType(CaptureIntentDto) {
    @ApiProperty({
        type: 'string',
        description: 'The product id',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    productId: string;

    @ApiProperty({
        type: 'number',
        description: 'The quantity of the product',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({
        type: 'string',
        description: 'The product id',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({
        type: 'string',
        description: 'The capsule to be taken per day',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    capsulePerDay: number;

}
