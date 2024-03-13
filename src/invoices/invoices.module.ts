import { Module, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InvoiceService } from './invoices.service';
import { PrismaService } from '../prisma.service';
import { TeamsServiceExtension2 } from '../teams/teams.service.extension2';
import { InvoiceController } from './invoices.controller';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../emails/email.module';

@Module({
  providers: [
    InvoiceService,
    PrismaService,
    TeamsServiceExtension2,
    JwtService,
  ],
  imports: [
    forwardRef(() => AuthModule),
    UsersModule,
    ProductsModule,
    EmailModule,
  ],
  controllers: [InvoiceController],
})
export class InvoicesModule {}
