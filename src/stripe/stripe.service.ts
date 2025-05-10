import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { Logger } from 'winston';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly supplementStripe: Stripe;

  constructor(
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
    @Inject('LOGGER') private readonly logger: Logger,
  ) {
    this.stripe = new Stripe(this.parameters.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
    this.supplementStripe = new Stripe(
      this.parameters.SUPPLEMENT_STRIPE_SECRET_KEY,
      {
        apiVersion: '2022-11-15',
      },
    );
  }

  getStripe(isSupplementApp = false): Stripe {
    return isSupplementApp ? this.supplementStripe : this.stripe;
  }

  async createCustomer(
    params: Stripe.CustomerCreateParams,
    isSupplementApp = false,
  ): Promise<Stripe.Customer> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.customers.create(params);
  }

  async updateCustomer(
    customerId: string,
    params: Stripe.CustomerUpdateParams,
    isSupplementApp = false,
  ): Promise<Stripe.Customer> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.customers.update(customerId, params);
  }

  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string,
    isSupplementApp = false,
  ): Promise<Stripe.PaymentMethod> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  async detachPaymentMethod(
    paymentMethodId: string,
    isSupplementApp = false,
  ): Promise<Stripe.PaymentMethod> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.paymentMethods.detach(paymentMethodId);
  }

  async retrievePaymentMethod(
    paymentMethodId: string,
    isSupplementApp = false,
  ): Promise<Stripe.PaymentMethod> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.paymentMethods.retrieve(paymentMethodId);
  }

  async listPaymentMethods(
    customerId: string,
    isSupplementApp = false,
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.customers.listPaymentMethods(customerId);
  }

  async createPaymentIntent(
    params: Stripe.PaymentIntentCreateParams,
    isSupplementApp = false,
  ): Promise<Stripe.PaymentIntent> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.paymentIntents.create(params);
  }

  async capturePaymentIntent(
    paymentIntentId: string,
    params?: Stripe.PaymentIntentCaptureParams,
    isSupplementApp = false,
  ): Promise<Stripe.PaymentIntent> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.paymentIntents.capture(paymentIntentId, params);
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
    isSupplementApp = false,
  ): Promise<Stripe.PaymentIntent> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async updatePaymentIntent(
    paymentIntentId: string,
    params: Stripe.PaymentIntentUpdateParams,
    isSupplementApp = false,
  ): Promise<Stripe.PaymentIntent> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.paymentIntents.update(paymentIntentId, params);
  }

  async createCoupon(
    params: Stripe.CouponCreateParams,
    isSupplementApp = false,
  ): Promise<Stripe.Coupon> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.coupons.create(params);
  }

  async constructWebhookEvent(
    payload: Buffer,
    signature: string,
    webhookSecret: string,
    isSupplementApp = false,
  ): Promise<Stripe.Event> {
    const stripe = this.getStripe(isSupplementApp);
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async createAccountLink(params: {
    account: string;
    refresh_url: string;
    return_url: string;
    type: 'account_onboarding' | 'account_update';
  }): Promise<string> {
    const link = await this.stripe.accountLinks.create(params);
    return link.url;
  }

  async createAccount(
    params: Stripe.AccountCreateParams,
    isSupplementApp = false,
  ): Promise<Stripe.Account> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.accounts.create(params);
  }

  async retrieveAccount(
    accountId: string,
    isSupplementApp = false,
  ): Promise<Stripe.Account> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.accounts.retrieve(accountId);
  }
  async createSetupIntent(
    params: Stripe.SetupIntentCreateParams,
    isSupplementApp = false,
  ): Promise<Stripe.SetupIntent> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.setupIntents.create(params);
  }

  async getPaymentMethod(
    paymentMethodId: string,
    isSupplementApp = false,
  ): Promise<Stripe.PaymentMethod> {
    const stripe = this.getStripe(isSupplementApp);
    return await stripe.paymentMethods.retrieve(paymentMethodId);
  }
}
