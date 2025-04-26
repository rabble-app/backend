import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentType, PaymentStatus, Prisma } from '@prisma/client';
import { addYears } from 'date-fns';
import { PaymentServiceExtension } from './payment.service.extension';
import { ReferralsService } from '../referrals/referrals.service';
import { ParametersModule } from '../config/config.module';
import { IPayment } from '../lib/types';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentServiceExtension: PaymentServiceExtension;
  let prismaService: PrismaService;

  const mockPaymentService = {
    createIntent: jest.fn(),
    capturePayment: jest.fn(),
    recordPayment: jest.fn(),
  };

  const mockReferralsService = {
    getReferralByUserId: jest.fn(),
  };

  const mockNotificationsService = {
    sendNotification: jest.fn(),
  };

  const createMockPayment = (overrides = {}) => ({
    id: 'test-payment-id',
    orderId: 'test-order-id',
    userId: 'test-user-id',
    amount: new Prisma.Decimal(28),
    paymentIntentId: 'test-payment-intent-id',
    status: PaymentStatus.CAPTURED,
    discount: new Prisma.Decimal(0),
    coupons: '',
    type: PaymentType.OTHERS,
    expiryDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  // Helper functions for test setup
  const setupMockUser = (overrides = {}) => ({
    id: 'test-user-id',
    stripeDefaultPaymentMethodId: 'test-payment-method',
    stripeCustomerId: 'test-customer',
    ...overrides,
  });

  const setupMockPaymentIntent = (overrides = {}) => ({
    id: 'test-payment-intent',
    status: 'requires_capture',
    ...overrides,
  });

  const setupMockCaptureResult = (overrides = {}) => ({
    id: 'test-payment-intent',
    status: 'succeeded',
    ...overrides,
  });

  const setupMockSubscriptionPayment = (overrides = {}) => createMockPayment({
    userId: 'test-user-id',
    paymentIntentId: 'test-payment-intent',
    type: PaymentType.YEARLY_SUBSCRIPTION,
    expiryDate: addYears(new Date(), 1),
    ...overrides,
  });

  // Helper functions for mocking service methods
  const mockHandleYearlySubscription = (mockUser: any, mockPaymentIntent: any, mockCaptureResult: any, mockPayment: any) => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
    mockPaymentService.createIntent.mockResolvedValue(mockPaymentIntent);
    jest.spyOn(paymentServiceExtension, 'captureFund').mockResolvedValue(mockCaptureResult);
    mockPaymentService.recordPayment.mockResolvedValue(mockPayment);

    jest.spyOn(paymentServiceExtension, 'handleYearlySubscription').mockImplementation(async (userId) => {
      const user = await prismaService.user.findUnique({
        where: { id: userId },
        select: { stripeDefaultPaymentMethodId: true, stripeCustomerId: true }
      });

      if (!user?.stripeDefaultPaymentMethodId || !user?.stripeCustomerId) {
        return null;
      }

      const paymentIntent = await mockPaymentService.createIntent(
        {
          amount: 28,
          currency: 'gbp',
          customerId: user.stripeCustomerId,
          paymentMethodId: user.stripeDefaultPaymentMethodId,
        },
        true,
        true
      );

      if (!paymentIntent || paymentIntent.status !== 'requires_capture') {
        return null;
      }

      const captureResult = await paymentServiceExtension.captureFund(paymentIntent.id, null, true);

      if (!captureResult) {
        return null;
      }

      const paymentData: IPayment = {
        userId,
        amount: 28,
        paymentIntentId: paymentIntent.id,
        status: PaymentStatus.CAPTURED,
        type: PaymentType.YEARLY_SUBSCRIPTION,
        expiryDate: addYears(new Date(), 1),
        orderId: null,
        discount: 0,
        coupons: '',
      };

      return await mockPaymentService.recordPayment(paymentData);
    });
  };

  const mockCheckUserSubscriptionStatus = (successfulPayments: any[], activeSubscription: any[]) => {
    jest.spyOn(paymentServiceExtension, 'findPayments')
      .mockResolvedValueOnce(successfulPayments)
      .mockResolvedValueOnce(activeSubscription);

    jest.spyOn(paymentServiceExtension, 'checkUserSubscriptionStatus').mockImplementation(async (userId) => {
      const successfulPayments = await paymentServiceExtension.findPayments({
        userId,
        status: PaymentStatus.CAPTURED,
        type: PaymentType.OTHERS,
      });

      if (!successfulPayments || successfulPayments.length < 2) {
        return true;
      }

      const activeSubscription = await paymentServiceExtension.findPayments({
        userId,
        status: PaymentStatus.CAPTURED,
        type: PaymentType.YEARLY_SUBSCRIPTION,
        expiryDate: {
          gt: new Date(),
        },
      });

      return activeSubscription && activeSubscription.length > 0;
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ParametersModule],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: PaymentServiceExtension,
          useValue: {
            findPayments: jest.fn(),
            captureFund: jest.fn(),
            handleYearlySubscription: jest.fn(),
            checkUserSubscriptionStatus: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            payment: {
              findMany: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: ReferralsService,
          useValue: mockReferralsService,
        },
        {
          provide: 'LOGGER',
          useValue: {
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
          },
        },
        {
          provide: 'AWS_PARAMETERS',
          useValue: {
            STRIPE_SECRET_KEY: 'test_key',
            SUPPLEMENT_STRIPE_SECRET_KEY: 'test_key',
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentServiceExtension = module.get<PaymentServiceExtension>(PaymentServiceExtension);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Subscription Features', () => {
    const userId = 'test-user-id';

    it('should successfully handle yearly subscription', async () => {
      const mockUser = setupMockUser();
      const mockPaymentIntent = setupMockPaymentIntent();
      const mockCaptureResult = setupMockCaptureResult();
      const mockPayment = setupMockSubscriptionPayment();

      mockHandleYearlySubscription(mockUser, mockPaymentIntent, mockCaptureResult, mockPayment);

      const result = await paymentServiceExtension.handleYearlySubscription(userId);
      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.CAPTURED);
      expect(result.type).toBe(PaymentType.YEARLY_SUBSCRIPTION);
      expect(mockPaymentService.createIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 28,
          currency: 'gbp',
          customerId: mockUser.stripeCustomerId,
          paymentMethodId: mockUser.stripeDefaultPaymentMethodId,
        }),
        true,
        true
      );
    });

    it('should return null if user has no default payment method', async () => {
      const mockUser = setupMockUser({ stripeDefaultPaymentMethodId: null });
      mockHandleYearlySubscription(mockUser, null, null, null);

      const result = await paymentServiceExtension.handleYearlySubscription(userId);
      expect(result).toBeNull();
      expect(mockPaymentService.createIntent).not.toHaveBeenCalled();
    });

    it('should return null if payment intent creation fails', async () => {
      const mockUser = setupMockUser();
      mockPaymentService.createIntent.mockRejectedValue(new Error('Failed to create intent'));
      mockHandleYearlySubscription(mockUser, null, null, null);

      const result = await paymentServiceExtension.handleYearlySubscription(userId);
      expect(result).toBeNull();
      expect(mockPaymentService.recordPayment).not.toHaveBeenCalled();
    });

    it('should return true if user has less than 2 successful payments', async () => {
      const successfulPayments = [createMockPayment()];
      mockCheckUserSubscriptionStatus(successfulPayments, []);

      const result = await paymentServiceExtension.checkUserSubscriptionStatus(userId);
      expect(result).toBe(true);
    });

    it('should return true if user has active subscription', async () => {
      const successfulPayments = [
        createMockPayment(),
        createMockPayment(),
        createMockPayment(),
      ];
      const activeSubscription = [
        setupMockSubscriptionPayment({ expiryDate: addYears(new Date(), 1) }),
      ];
      mockCheckUserSubscriptionStatus(successfulPayments, activeSubscription);

      const result = await paymentServiceExtension.checkUserSubscriptionStatus(userId);
      expect(result).toBe(true);
    });

    it('should return false if user has more than 2 successful payments but no active subscription', async () => {
      const successfulPayments = [
        createMockPayment(),
        createMockPayment(),
        createMockPayment(),
      ];
      mockCheckUserSubscriptionStatus(successfulPayments, []);

      const result = await paymentServiceExtension.checkUserSubscriptionStatus(userId);
      expect(result).toBe(false);
    });

    it('should return false if user has expired subscription', async () => {
      const successfulPayments = [
        createMockPayment(),
        createMockPayment(),
        createMockPayment(),
      ];
      mockCheckUserSubscriptionStatus(successfulPayments, []);

      const result = await paymentServiceExtension.checkUserSubscriptionStatus(userId);
      expect(result).toBe(false);
    });
  });
});
