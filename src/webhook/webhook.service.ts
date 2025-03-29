import { Inject, Injectable } from '@nestjs/common';
import { ReferralsService } from '../referrals/referrals.service';
import Stripe from 'stripe';
import { Logger } from 'winston';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WebhookService {
  private readonly stripe: Stripe;

  constructor(
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
    @Inject('LOGGER') private readonly logger: Logger,
    private readonly referralsService: ReferralsService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.parameters.SUPPLEMENT_STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  /**
   * Constructs a Stripe webhook event from the given payload and signature
   * Handles 'payment_intent.succeeded' events by logging and processing referrals
   * 
   * @param signature The Stripe webhook signature for verification
   * @param payload The raw webhook payload buffer
   * @returns void
   * for local testing use this env value SUPPLEMENT_STRIPE_LOCAL_WEBHOOK_SECRET
   */
  public async constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.parameters.SUPPLEMENT_STRIPE_WEBHOOK_SECRET;
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntentSucceeded = event.data
          .object as Stripe.PaymentIntent;
        this.logger.info(
          'Payment intent succeeded: %o',
          paymentIntentSucceeded,
        );
        await this.referralsService.handleReferral(
          paymentIntentSucceeded.metadata,
          paymentIntentSucceeded.amount_received / 100,
        );
      }
    } catch (error) {
      console.log(error)
      return;
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
