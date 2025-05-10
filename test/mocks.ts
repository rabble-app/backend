import { FirebaseService } from '../src/notifications/firebase.service';
import { Stripe } from 'stripe';
import { StripeService } from '../src/stripe/stripe.service';
import { CourierService } from '../src/notifications/courier.service';
import faker from '@faker-js/faker';

export const mockFirebaseService = {
  sendPushNotification: jest.fn(),
} as unknown as FirebaseService;

export const mockCourierService = {
  sendEmailVerification: jest.fn(),
  sendPasswordReset: jest.fn(),
  sendWelcomeEmail: jest.fn(),
  sendMagicLink: jest.fn(),
} as unknown as CourierService;

// AWS Parameters mock
export const mockAwsParameters = {
  FIREBASE_PROJECT_ID: 'test-project',
  FIREBASE_PRIVATE_KEY: 'test-private-key',
  FIREBASE_CLIENT_EMAIL: 'test@example.com',
  TWILO_SID: 'test-sid',
  TWILO_AUTH_TOKEN: 'test-auth-token',
  TWILO_PHONE: '+1234567890',
  STRIPE_SECRET_KEY: 'test-stripe-secret',
  STRIPE_WEBHOOK_SECRET: 'test-stripe-webhook-secret',
  SUPPLEMENT_STRIPE_SECRET_KEY: 'test-supplement-stripe-secret',
  COURIER_API: 'test-courier-api',
  EMAIL_VERIFICATION_TEMPLATE: 'test-email-verification-template',
  RESET_PASSWORD_TEMPLATE: 'test-reset-password-template',
  WELCOME_EMAIL_TEMPLATE: 'test-welcome-email-template',
  MAGIC_LINK_TEMPLATE: 'test-magic-link-template',
};

// Stripe client mock
const mockStripeClient = {
  customers: {
    create: jest.fn().mockImplementation((params) =>
      Promise.resolve({
        id: `cus_test123-${new Date().getTime()}`,
        email: params.email,
        name: params.name,
        metadata: params.metadata,
      }),
    ),
    retrieve: jest.fn().mockImplementation((id) =>
      Promise.resolve({
        id,
        email: 'test@example.com',
        name: 'Test Customer',
      }),
    ),
    update: jest.fn().mockImplementation((id, params) =>
      Promise.resolve({
        id,
        ...params,
      }),
    ),
    del: jest.fn().mockImplementation(() => Promise.resolve({ deleted: true })),
    listPaymentMethods: jest.fn().mockImplementation((customerId) =>
      Promise.resolve({
        data: [],
        has_more: false,
        url: '',
      }),
    ),
  },
  paymentMethods: {
    attach: jest.fn().mockImplementation((paymentMethodId, params) =>
      Promise.resolve({
        id: paymentMethodId,
        customer: params.customer,
        type: 'card',
        card: {
          last4: '1234',
          fingerprint: 'test-fingerprint',
        },
      }),
    ),
    detach: jest.fn().mockImplementation((paymentMethodId) =>
      Promise.resolve({
        id: paymentMethodId,
        detached: true,
      }),
    ),
    retrieve: jest.fn().mockImplementation((paymentMethodId) =>
      Promise.resolve({
        id: paymentMethodId,
        type: 'card',
        card: {
          last4: '1234',
          fingerprint: 'test-fingerprint',
        },
      }),
    ),
    create: jest.fn().mockImplementation((params) =>
      Promise.resolve({
        id: `pm_test123-${new Date().getTime()}`,
        ...params,
      }),
    ),
  },
  paymentIntents: {
    create: jest.fn().mockImplementation((params) =>
      Promise.resolve({
        id: `pi_test123-${new Date().getTime()}`,
        amount: params.amount,
        currency: params.currency,
        status: 'requires_capture',
        client_secret: 'pi_test123_secret',
      }),
    ),
    retrieve: jest.fn().mockImplementation((id) =>
      Promise.resolve({
        id,
        amount: 1000,
        currency: 'usd',
        status: 'succeeded',
      }),
    ),
    update: jest.fn().mockImplementation((id, params) =>
      Promise.resolve({
        id,
        ...params,
        status: 'succeeded',
      }),
    ),
    capture: jest.fn().mockImplementation((id, params) =>
      Promise.resolve({
        id,
        ...params,
        status: 'succeeded',
      }),
    ),
  },
  setupIntents: {
    create: jest.fn().mockImplementation((params) =>
      Promise.resolve({
        id: 'seti_test123',
        client_secret: 'seti_test123_secret',
        status: 'requires_payment_method',
      }),
    ),
  },
  accounts: {
    create: jest.fn().mockImplementation((params) =>
      Promise.resolve({
        id: 'acct_test123',
        ...params,
      }),
    ),
    retrieve: jest.fn().mockImplementation((id) =>
      Promise.resolve({
        id,
        type: 'standard',
      }),
    ),
  },
  accountLinks: {
    create: jest.fn().mockImplementation((params) =>
      Promise.resolve({
        url: 'https://connect.stripe.com/setup/s/test',
      }),
    ),
  },
  coupons: {
    create: jest.fn().mockImplementation((params) =>
      Promise.resolve({
        id: 'coupon_test123',
        ...params,
      }),
    ),
  },
  webhooks: {
    constructEvent: jest
      .fn()
      .mockImplementation((payload, signature, secret) => ({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            amount: 1000,
            currency: 'usd',
            status: 'succeeded',
          },
        },
      })),
  },
} as unknown as Stripe;

// StripeService mock
export const mockStripeService = {
  getStripe: jest
    .fn()
    .mockImplementation((isSupplementApp = false) => mockStripeClient),
  createCustomer: jest
    .fn()
    .mockImplementation((params, isSupplementApp = false) =>
      mockStripeClient.customers.create(params),
    ),
  updateCustomer: jest
    .fn()
    .mockImplementation((customerId, params, isSupplementApp = false) =>
      mockStripeClient.customers.update(customerId, params),
    ),
  attachPaymentMethod: jest
    .fn()
    .mockImplementation(
      (paymentMethodId, customerId, isSupplementApp = false) =>
        mockStripeClient.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        }),
    ),
  detachPaymentMethod: jest
    .fn()
    .mockImplementation((paymentMethodId, isSupplementApp = false) =>
      mockStripeClient.paymentMethods.detach(paymentMethodId),
    ),
  retrievePaymentMethod: jest
    .fn()
    .mockImplementation((paymentMethodId, isSupplementApp = false) =>
      mockStripeClient.paymentMethods.retrieve(paymentMethodId),
    ),
  listPaymentMethods: jest
    .fn()
    .mockImplementation((customerId, isSupplementApp = false) =>
      mockStripeClient.customers.listPaymentMethods(customerId),
    ),
  createPaymentIntent: jest
    .fn()
    .mockImplementation((params, isSupplementApp = false) =>
      mockStripeClient.paymentIntents.create(params),
    ),
  capturePaymentIntent: jest
    .fn()
    .mockImplementation((paymentIntentId, params, isSupplementApp = false) =>
      mockStripeClient.paymentIntents.capture(paymentIntentId, params),
    ),
  retrievePaymentIntent: jest
    .fn()
    .mockImplementation((paymentIntentId, isSupplementApp = false) =>
      mockStripeClient.paymentIntents.retrieve(paymentIntentId),
    ),
  updatePaymentIntent: jest
    .fn()
    .mockImplementation((paymentIntentId, params, isSupplementApp = false) =>
      mockStripeClient.paymentIntents.update(paymentIntentId, params),
    ),
  createCoupon: jest
    .fn()
    .mockImplementation((params, isSupplementApp = false) =>
      mockStripeClient.coupons.create(params),
    ),
  constructWebhookEvent: jest
    .fn()
    .mockImplementation(
      (payload, signature, webhookSecret, isSupplementApp = false) =>
        mockStripeClient.webhooks.constructEvent(
          payload,
          signature,
          webhookSecret,
        ),
    ),
  createAccountLink: jest
    .fn()
    .mockImplementation((params) =>
      mockStripeClient.accountLinks.create(params).then((link) => link.url),
    ),
  createAccount: jest
    .fn()
    .mockImplementation((params, isSupplementApp = false) =>
      mockStripeClient.accounts.create(params),
    ),
  retrieveAccount: jest
    .fn()
    .mockImplementation((accountId, isSupplementApp = false) =>
      mockStripeClient.accounts.retrieve(accountId),
    ),
  createSetupIntent: jest
    .fn()
    .mockImplementation((params, isSupplementApp = false) =>
      mockStripeClient.setupIntents.create(params),
    ),
  getPaymentMethod: jest
    .fn()
    .mockImplementation((paymentMethodId, isSupplementApp = false) =>
      mockStripeClient.paymentMethods.retrieve(paymentMethodId),
    ),
} as unknown as StripeService;
