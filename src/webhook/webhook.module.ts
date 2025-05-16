import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { ReferralsService } from '../referrals/referrals.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { StripeService } from '../stripe/stripe.service';

@Module({
  controllers: [WebhookController],
  providers: [
    WebhookService,
    ReferralsService,
    PrismaService,
    UsersService,
    StripeService,
  ],
})
export class WebhookModule {}
