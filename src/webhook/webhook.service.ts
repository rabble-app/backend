import { Inject, Injectable } from '@nestjs/common';
import { ReferralsService } from '../referrals/referrals.service';
import Stripe from 'stripe';
import { Logger } from 'winston';
import { PrismaService } from '../prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class WebhookService {
  constructor(
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
    @Inject('LOGGER') private readonly logger: Logger,
    private readonly referralsService: ReferralsService,
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Constructs a Stripe webhook event from the given payload and signature
   * Handles 'payment_intent.succeeded' events by logging and processing referrals
   *
   * @param signature The Stripe webhook signature for verification
   * @param payload The raw webhook payload buffer
   * @returns void
   * for local testing use this env value SUPPLEMENT_STRIPE_LOCAL_WEBHOOK_SECRET
   */
  public async handleWebhook(
    signature: string,
    payload: Buffer,
    isSupplementApp = true,
  ): Promise<void> {
    const webhookSecret = isSupplementApp
      ? this.parameters.SUPPLEMENT_STRIPE_WEBHOOK_SECRET
      : this.parameters.STRIPE_WEBHOOK_SECRET;
    this.logger.info('Webhook secret: %o', webhookSecret);

    try {
      const event = await this.stripeService.constructWebhookEvent(
        payload,
        signature,
        webhookSecret,
        isSupplementApp,
      );

      this.logger.info('Event: %o', event);
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        this.logger.info('Payment intent succeeded: %o', paymentIntent);
        await this.referralsService.handleReferral(
          paymentIntent.metadata,
          paymentIntent.amount_received / 100,
        );
      }
    } catch (err) {
      this.logger.error('Error processing webhook: %o', err);
      throw err;
    }
  }

  async updatePayment(paymentIntent: Stripe.PaymentIntent) {
    if (
      paymentIntent?.metadata.coupons &&
      +paymentIntent?.metadata.amount_off
    ) {
      this.logger.info('Updating payment with coupons: %o', {
        coupons: paymentIntent.metadata.coupons,
        amount_off: paymentIntent.metadata.amount_off,
        paymentIntentId: paymentIntent.id,
      });
      const payment = await this.prisma.payment.findUnique({
        where: { paymentIntentId: paymentIntent.id },
      });
      const result = await this.prisma.payment.update({
        where: { id: payment?.id },
        data: {
          coupons: paymentIntent.metadata.coupons,
          discount: +paymentIntent.metadata.amount_off / 100,
        },
      });
      this.logger.info('Payment updated: %o', result);
    }
  }
}
