import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  private readonly stripe: Stripe;

  constructor(
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
  ) {
    this.stripe = new Stripe(this.parameters.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  public async constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.parameters.STRIPE_WEBHOOK_SECRET;

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      // Handle the event
      switch (event.type) {
        case 'charge.captured':
          const chargeCaptured = event.data.object;
          console.log(chargeCaptured);
          break;
      }
    } catch (error) {
      return;
    }
  }
}
