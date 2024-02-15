import { Module } from '@nestjs/common';
import { InvoiceService } from './invoices.service';
import { PrismaService } from '../prisma.service';
import { TeamsServiceExtension2 } from 'teams/teams.service.extension2';
import { InvoiceController } from './invoices.controller';

@Module({
  providers: [InvoiceService, PrismaService],
  imports: [],
  controllers: [InvoiceController],
})
export class InvoicesModule {}
