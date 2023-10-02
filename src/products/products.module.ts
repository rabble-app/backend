import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma.service';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
  exports: [ProductsService],
  imports: [forwardRef(() => PaymentModule)],
})
export class ProductsModule {}
