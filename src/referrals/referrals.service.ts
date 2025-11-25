import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BonusDto, ClaimCCDto } from './dto/referrals.dto';
import { PrismaService } from '../prisma.service';
import crypto from 'crypto';
import {
  AffiliateRewardType,
  BonusType,
  PaymentStatus,
  ReferralType,
} from '@prisma/client';
import { UsersService } from '../users/users.service';
import Rollbar from 'rollbar';
import { Logger } from 'winston';
import {
  CC_TO_POUNDS_RATE,
  MINIMUM_STRIPE_AMOUNT_IN_PENCE,
  REFERRAL_BONUS_PERCENTAGE,
} from '../utils/constants';
import { addMonths, differenceInMonths, differenceInDays } from 'date-fns';
import { StripeService } from '../stripe/stripe.service';
import { CourierService } from '../notifications/courier.service';

@Injectable()
export class ReferralsService {
  private static readonly CODE_LENGTH = 6;
  private static readonly USER_CODE_LENGTH = 3;
  private static readonly CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  private static readonly MINIMUM_CREDIT_AMOUNT = 500; // £5 in pence

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    @Inject('ROLLBAR') private readonly rollbar: Rollbar,
    @Inject('LOGGER') private readonly logger: Logger,
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
    private readonly stripeService: StripeService,
    private readonly courierService: CourierService,
  ) {}

  async generateReferralCode() {
    let code = this.generateRandomCode();
    while (await this.prisma.user.findUnique({ where: { refCode: code } })) {
      code = this.generateRandomCode();
    }
    return code;
  }

  async generateUserCode(firstName: string) {
    let code = this.generateRandomCode(ReferralsService.USER_CODE_LENGTH);
    let userCode = `${firstName.toUpperCase()}-${code}`;
    while (await this.prisma.user.findUnique({ where: { userCode } })) {
      code = this.generateRandomCode(ReferralsService.USER_CODE_LENGTH);
      userCode = `${firstName.toUpperCase()}-${code}`;
    }
    return userCode;
  }

  private generateRandomCode(
    codeLength: number = ReferralsService.CODE_LENGTH,
  ): string {
    let code = '';
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = crypto.randomInt(
        0,
        ReferralsService.CHARACTERS.length,
      );
      code += ReferralsService.CHARACTERS[randomIndex];
    }
    return code;
  }

  async handleReferral(metadata: Record<string, any>, amount: number) {
    this.logger.info('Handling referral %o', { metadata, amount });
    const { order_id, user_id } = metadata;
    const user = await this.usersService.findUser({ id: user_id });
    if (!user) {
      this.logger.error('REFERRAL: User not found %o', metadata);
      this.rollbar.error('REFERRAL: User not found %o', metadata);
      return;
    }
    const firstTimePurchase = await this.getFirstTimePurchase(
      user_id,
      metadata,
      amount,
    );
    if (!firstTimePurchase) {
      return;
    }
    const referral = await this.getReferral(user_id);
    if (!referral) {
      this.logger.info(
        'REFERRAL: No referral found  for this purchase %o',
        metadata,
      );
      return;
    }
    if (referral.type === ReferralType.AFFILIATE) {
      // Handle affiliate referral bonus
      await this.applyAffiliateBonus({
        userId: user_id,
        affiliateId: referral.affiliateId,
        purchaseAmount: amount,
        orderId: order_id,
      });
      return;
    }
    const sponsor = await this.usersService.findUser({
      id: referral.referrerId,
    });
    if (!sponsor) {
      this.logger.error(
        'REFERRAL: User with referrerId %s not found: %o',
        referral.referrerId,
        metadata,
      );
      this.rollbar.error(
        'REFERRAL: User with referrerId %s not found: %o',
        referral.referrerId,
        metadata,
      );
      return;
    }
    const referralCount = await this.countReferrals(sponsor.id);
    const totalSubscriptionDuration = await this.checkFreeSubscriptionDuration(
      sponsor.id,
      sponsor.firstPaymentDate,
    );
    const { isEarly: isEarlyUser } = await this.usersService.isEarlyUser();
    const isFirst30Days = await this.usersService.isUserFirst30Days(
      referral.referrerId,
    );
    if (
      isEarlyUser &&
      isFirst30Days &&
      referralCount <= 3 &&
      totalSubscriptionDuration < 2
    ) {
      await Promise.all([
        this.applyFreeSubscriptionBonus({
          userId: referral.referrerId,
          orderId: order_id,
          referralId: referral.userId,
        }),
        this.applyFreeSubscriptionBonus({
          userId: referral.userId,
          orderId: order_id,
        }),
      ]);
      return;
    }
    const bonusAmount = this.calculateReferralBonus(+firstTimePurchase);
    this.logger.info('REFERRAL: Calculated referral bonus: %s', bonusAmount);
    const bonusAmountInCC = this.poundsToCC(bonusAmount);
    await this.handleBonus({
      userId: user_id,
      amount: bonusAmountInCC,
      type: BonusType.SIGNUP,
      orderId: order_id,
    });
    await this.handleBonus({
      userId: sponsor.id,
      amount: bonusAmountInCC,
      type: BonusType.REFERRAL,
      referralId: user_id,
      orderId: order_id,
    });

    // Send email to sponsor about earned coins
    await this.sendCoinEarnedEmail(sponsor, bonusAmountInCC);
  }

  async applyFreeSubscriptionBonus({
    userId,
    orderId,
    referralId,
    category = '6 months free subscription',
    duration = 6,
    type = BonusType.REFERRAL,
  }: {
    userId: string;
    orderId: string;
    referralId?: string;
    category?: string;
    duration?: number;
    type?: BonusType;
  }) {
    try {
      this.logger.info('REFERRAL: Applying free subscription bonus %o', {
        userId,
        orderId,
      });
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: {
            firstPaymentDate: true,
            email: true,
            firstName: true,
            refCode: true,
            userCode: true,
            id: true,
          },
        });
        if (!user?.firstPaymentDate) {
          this.logger.error(
            'REFERRAL: Cannot apply free subscription bonus. User not found',
            { userId, orderId, referralId },
          );
          return;
        }
        const subscription = await tx.subscription.findFirst({
          where: { userId },
        });
        if (!subscription) {
          this.logger.error(
            'REFERRAL: Cannot apply free subscription bonus. Subscription not found',
            { userId, orderId, referralId },
          );
          return;
        }

        await Promise.all([
          tx.subscription.update({
            where: { id: subscription.id },
            data: {
              expiryDate: addMonths(
                new Date(subscription.expiryDate),
                duration,
              ),
            },
          }),
          tx.bonus.create({
            data: {
              userId,
              amount: 0,
              type,
              category,
              orderId,
              ...(referralId && { referralId }),
            },
          }),
        ]);

        // Send email to the referral after successful subscription update
        if (user) {
          this.sendReferralFreeMonthEmail(user);
        }
      });
    } catch (error) {
      this.logger.error(
        'REFERRAL: Failed to apply free subscription bonus %o',
        {
          userId,
          orderId,
          error,
        },
      );
      throw new HttpException(
        'Failed to apply free subscription bonus',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async sendReferralFreeMonthEmail(user: {
    id: string;
    email: string;
    firstName: string;
    refCode: string;
    userCode: string;
    firstPaymentDate: Date;
  }) {
    try {
      // Calculate days left (30 days - days since firstPaymentDate)
      const today = new Date();
      const daysSinceFirstPayment = differenceInDays(
        today,
        user.firstPaymentDate,
      );
      const daysLeft = Math.max(0, 30 - daysSinceFirstPayment);

      // Create referral link
      const referralLink = `${this.parameters.SUPPLEMENT_EMAIL_URL}?ref=${user.refCode}`;
      const dashboardLink = `${this.parameters.SUPPLEMENT_EMAIL_URL}/dashboard`;

      // Send the email
      await this.courierService.sendReferralFreeMonthMail(
        user.email,
        user.firstName,
        `${daysLeft}`,
        user.userCode,
        referralLink,
        dashboardLink,
      );
    } catch (error) {
      this.logger.error('Failed to send referral free month email', {
        userId: user.id,
        error,
      });
      // Don't throw the error to avoid breaking the main transaction
    }
  }

  async handleBonus(bonusDto: BonusDto) {
    this.logger.info(
      `PAYMENT WEBHOOK: Creating ${bonusDto.type} bonus: %o`,
      bonusDto,
    );
    await this.prisma.bonus.create({
      data: {
        userId: bonusDto.userId,
        amount: bonusDto.amount,
        type: bonusDto.type,
        ...(bonusDto.referralId && { referralId: bonusDto.referralId }),
        ...(bonusDto.orderId && { orderId: bonusDto.orderId }),
      },
    });
    await this.updateWallet(bonusDto.userId, bonusDto.amount);
  }

  async updateWallet(userId: string, amount: number) {
    this.logger.info(
      `REFERRAL: Updating wallet for user ${userId} with amount ${amount}`,
    );
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      this.logger.info(
        'REFERRAL: User %s has no wallet, creating one...',
        userId,
      );

      await this.prisma.wallet.create({
        data: { userId, balance: amount, claimed: 0 },
      });
    } else {
      await this.prisma.wallet.update({
        where: { userId },
        data: {
          balance: { increment: amount },
        },
      });
    }
    this.logger.info(
      `REFERRAL: Updated wallet for user ${userId} with amount ${amount}`,
    );
  }

  async getFirstTimePurchase(
    userId: string,
    metadata: Record<string, any>,
    amount: number,
  ) {
    const payments = await this.prisma.payment.findMany({
      where: {
        userId,
        status: PaymentStatus.CAPTURED,
      },
    });
    if (payments.length === 0) {
      this.logger.info(
        'REFERRAL: User has no payments: %s: %o',
        userId,
        metadata,
      );
      return amount;
    }
    if (payments.length > 1) {
      this.logger.info(
        'REFERRAL: User has more than one payment. Exiting...: %s: %o',
        userId,
        metadata,
      );
      this.rollbar.info(
        'REFERRAL: User has more than one payment. Exiting...: %s: %o',
        userId,
        metadata,
      );
      return false;
    }
    return payments[0].amount;
  }

  async isFirstTimePurchase(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId, status: PaymentStatus.CAPTURED },
    });
    return payments?.length === 0;
  }

  public poundsToCC(pounds: number) {
    const cc = pounds * CC_TO_POUNDS_RATE;
    return Math.round(cc / 10) * 10;
  }

  public ccToPounds(cc: number) {
    const pounds = cc / CC_TO_POUNDS_RATE;
    return pounds;
  }

  private calculateReferralBonus(amount: number) {
    return amount * REFERRAL_BONUS_PERCENTAGE;
  }

  async claimRewards({ userId, rewardId }: ClaimCCDto) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      this.rollbar.error('CC CLAIM: User has no wallet', {
        userId,
        rewardId,
      });
      throw new HttpException('User has no wallet', HttpStatus.BAD_REQUEST);
    }
    const reward = await this.prisma.reward.findUnique({
      where: { id: rewardId },
    });
    if (!reward) {
      this.rollbar.error(
        'CC CLAIM: No Reward category matches the specified rewardId',
        {
          userId,
          rewardId,
        },
      );
      throw new HttpException(
        'No Reward category matches the specified rewardId',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (+wallet.balance < reward.amount) {
      this.rollbar.error(
        'CC CLAIM: The CC balance is less than the reward amount',
        {
          userId,
          rewardId,
        },
      );
      throw new HttpException(
        'The CC balance is less than the reward amount',
        HttpStatus.BAD_REQUEST,
      );
    }
    const creditValue = this.getRewardValue(reward.amount, reward.rate);
    const [_wallet, claim] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: reward.amount },
          claimed: { increment: reward.amount },
          availableCredits: { increment: creditValue },
        },
      }),
      this.prisma.claim.create({
        data: {
          userId,
          amount: reward.amount,
          rewardId: reward.id,
        },
      }),
    ]);
    if (claim && _wallet) {
      return _wallet;
    }
  }

  getRewardValue(rewardAmount: number, rewardRate: number) {
    return rewardAmount / rewardRate;
  }

  async getReferralInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        refCode: true,
        userCode: true,
        referrerId: true,
        _count: {
          select: {
            teams: true,
          },
        },
      },
    });
    if (!user?.refCode) {
      this.logger.info('REFERRAL INFO: User has no referral code %o', {
        userId,
      });
      this.rollbar.info('REFERRAL INFO: User has no referral code %o', {
        userId,
      });
      return;
    }
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    const claims = await this.prisma.claim.findMany({
      where: { userId },
    });

    const totalSaved = await this.prisma.coupon.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    // Get bonuses with free subscription categories
    const freeSubscriptionBonuses = await this.prisma.bonus.findMany({
      where: {
        userId,
        category: {
          in: ['1 year free subscription', '6 months free subscription'],
        },
      },
      select: {
        category: true,
      },
    });

    // Calculate total free months received
    const totalFreeMonths = freeSubscriptionBonuses.reduce((total, bonus) => {
      if (bonus.category === '1 year free subscription') {
        return total + 12;
      } else if (bonus.category === '6 months free subscription') {
        return total + 6;
      }
      return total;
    }, 0);

    const referrer = await this.getReferrer(userId);
    return {
      referralCode: user.refCode,
      userCode: user.userCode,
      teams: user._count.teams,
      wallet,
      totalSaved: totalSaved._sum.amount,
      claims,
      freeMonthsReceived: totalFreeMonths,
      ...(referrer && {
        referrer,
      }),
    };
  }

  async getRewardCategories() {
    return await this.prisma.reward.findMany();
  }

  async getAvailableCredits(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    return +(wallet?.availableCredits ?? 0);
  }

  async createCoupon(userId: string, amount: number) {
    const coupon = await this.stripeService.createCoupon(
      {
        amount_off: amount * 100,
        duration: 'once',
        currency: 'GBP',
        metadata: {
          userId,
        },
      },
      true,
    );
    this.logger.info('CC CREATE COUPON: Created coupon %s', coupon.id);
    await this.prisma.coupon.create({
      data: {
        userId,
        couponId: coupon.id,
        amount: amount,
      },
    });
    return coupon;
  }

  private calculateCouponValues(
    availableCredits: number,
    captureAmount: number,
  ) {
    if (availableCredits >= captureAmount) {
      return {
        creditBalance: availableCredits - captureAmount,
        couponValue: captureAmount,
        remainingAmount: 0,
        fullCoverage: true,
      };
    }

    const remainingAfterCredits = captureAmount - availableCredits;
    if (remainingAfterCredits < MINIMUM_STRIPE_AMOUNT_IN_PENCE) {
      return {
        creditBalance: MINIMUM_STRIPE_AMOUNT_IN_PENCE,
        couponValue: availableCredits - MINIMUM_STRIPE_AMOUNT_IN_PENCE,
        remainingAmount:
          captureAmount - availableCredits + MINIMUM_STRIPE_AMOUNT_IN_PENCE,
        fullCoverage: false,
      };
    }

    return {
      creditBalance: 0,
      couponValue: availableCredits,
      remainingAmount: captureAmount - availableCredits,
      fullCoverage: false,
    };
  }

  async applyCoupon(userId: string, captureAmount: number) {
    const result = {
      amount: captureAmount,
      couponId: null,
      amountOff: 0,
      fullCouponCoverage: false,
    };

    const {
      creditBalance,
      couponValue,
      remainingAmount,
      fullCoverage,
      availableCredits,
    } = await this.getAvailableCreditInfo(userId, captureAmount);
    if (availableCredits < ReferralsService.MINIMUM_CREDIT_AMOUNT) {
      this.logger.info('CC APPLY COUPON: Insufficient credits', {
        userId,
        availableCredits,
      });
      return result;
    }

    const coupon = await this.createCoupon(userId, couponValue / 100);

    await this.prisma.wallet.update({
      where: { userId },
      data: { availableCredits: creditBalance / 100 },
    });

    return {
      amount: remainingAmount,
      couponId: coupon.id,
      amountOff: couponValue,
      fullCouponCoverage: fullCoverage,
    };
  }

  async getReferralTracking(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });
    const referralTracking = await this.prisma.bonus.findMany({
      where: { userId },
      select: {
        type: true,
        amount: true,
        referralId: true,
        createdAt: true,
        category: true,
        order: {
          select: {
            id: true,
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    const referralTrackingWithReferral = await Promise.all(
      referralTracking.map(async (item) => {
        if (item.referralId) {
          const referral = await this.prisma.user.findUnique({
            where: { id: item.referralId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          });
          return {
            amount: +item.amount,
            referral: referral,
            type: item.type,
            referralTeam: item.order?.team?.name,
            createdAt: item.createdAt,
            category: item.category,
          };
        }
        return {
          amount: +item.amount,
          type: item.type,
          userTeam: item.order?.team?.name,
          createdAt: item.createdAt,
          category: item.category,
        };
      }),
    );
    return {
      user,
      earnings: referralTrackingWithReferral,
    };
  }

  async getAvailableCreditInfo(userId: string, captureAmount: number) {
    const availableCredits = +(await this.getAvailableCredits(userId)) * 100;

    if (availableCredits < ReferralsService.MINIMUM_CREDIT_AMOUNT) {
      return {
        creditBalance: availableCredits,
        couponValue: 0,
        remainingAmount: captureAmount,
        fullCoverage: false,
        availableCredits,
      };
    }
    const { creditBalance, couponValue, remainingAmount, fullCoverage } =
      this.calculateCouponValues(availableCredits, captureAmount);
    return {
      creditBalance,
      couponValue,
      remainingAmount,
      fullCoverage,
      availableCredits,
    };
  }

  async getApplicableCredits(userId: string, captureAmount: number) {
    const captureAmountInPence = captureAmount * 100;
    const { creditBalance, couponValue, remainingAmount, availableCredits } =
      await this.getAvailableCreditInfo(userId, captureAmountInPence);
    return {
      creditBalance: creditBalance / 100,
      applicableCredits: couponValue / 100,
      amountToPay: remainingAmount / 100,
      availableCredits: availableCredits / 100,
    };
  }

  async handleRefCodeAndFreeTrial(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { refCode: true, userCode: true, firstName: true },
      });

      if (user?.refCode && user?.userCode) {
        this.logger.info('User already has referral codes', { userId });
        return;
      }

      const referralCode = await this.generateReferralCode();
      const userCode = await this.generateUserCode(user.firstName);

      await this.prisma.user.update({
        where: { id: userId },
        data: { refCode: referralCode, userCode },
      });

      this.logger.info('Referral code and user code generated %o', {
        userId,
        referralCode,
        userCode,
      });

      await this.createFreeTrialSubscription(userId);
    } catch (error) {
      this.logger.error('Failed to handle referral code and free trial', {
        userId,
        error,
      });
    }
  }

  async createFreeTrialSubscription(userId: string) {
    try {
      const { isEarly: earlyUser } = await this.usersService.isEarlyUser();

      const existingSubscription = await this.prisma.subscription.findUnique({
        where: { userId },
      });
      if (existingSubscription) {
        this.logger.warn('User already has a subscription', { userId });
        return;
      }

      const existingBonus = await this.prisma.bonus.findFirst({
        where: {
          userId,
          type: BonusType.FREE_TRIAL,
          category: earlyUser
            ? '1 year free subscription'
            : '6 months free subscription',
        },
      });

      if (existingBonus) {
        this.logger.warn('User already has a free trial bonus', { userId });
        return;
      }

      await this.prisma.subscription.create({
        data: {
          userId,
          expiryDate: addMonths(new Date(), earlyUser ? 12 : 6),
        },
      });

      await this.prisma.bonus.create({
        data: {
          userId,
          amount: 0,
          type: BonusType.FREE_TRIAL,
          category: earlyUser
            ? '1 year free subscription'
            : '6 months free subscription',
        },
      });
    } catch (error) {
      this.logger.error('Failed to create free trial subscription', {
        userId,
        error,
      });
      this.rollbar.error('Failed to create free trial subscription', {
        userId,
        error,
      });
    }
  }

  async createReferral(userId: string, refCode: string) {
    const referrer = await this.prisma.user.findFirst({
      where: { refCode },
    });
    if (referrer) {
      await this.prisma.referral.create({
        data: { userId, referrerId: referrer.id },
      });
      return;
    }
    /*
    if no referrer, check if the refCode is an affiliate code
    if it is, create a referral with type AFFILIATE
    */
    const affiliate = await this.getAffiliate(refCode);
    if (affiliate) {
      await this.prisma.referral.create({
        data: {
          userId,
          affiliateId: affiliate.id,
          type: ReferralType.AFFILIATE,
        },
      });
    }
  }

  async getReferral(userId: string) {
    return await this.prisma.referral.findFirst({
      where: { userId },
    });
  }

  async getReferrer(userId: string) {
    const referral = await this.getReferral(userId);
    if (!referral) {
      return null;
    }
    if (referral.type === ReferralType.AFFILIATE) {
      return {
        affiliateId: referral.affiliateId,
        type: referral.type,
      };
    }
    const referrer = await this.prisma.user.findUnique({
      where: { id: referral.referrerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });
    return {
      referrerId: referrer.id,
      type: referral.type,
      name: `${referrer.firstName} ${referrer.lastName}`,
    };
  }

  async countReferrals(userId: string) {
    const referrals = await this.prisma.referral.count({
      where: { referrerId: userId },
    });
    return referrals;
  }

  async checkFreeSubscriptionDuration(userId: string, firstPaymentDate: Date) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (!subscription) {
      this.logger.error('Subscription not found', { userId });
      return 0;
    }
    const totalSubscriptionDuration =
      differenceInMonths(
        new Date(subscription.expiryDate),
        new Date(firstPaymentDate),
      ) / 12;
    return totalSubscriptionDuration;
  }

  async applyUserCode(
    userId: string,
    userCode: string,
    purchaseAmount: number,
  ) {
    this.logger.info('Applying user code %o', {
      userId,
      userCode,
      purchaseAmount,
    });
    const referral = await this.getReferral(userId);
    if (referral) {
      throw new HttpException('Code already used', HttpStatus.CONFLICT);
    }
    const isFirstTimePurchase = await this.isFirstTimePurchase(userId);
    if (!isFirstTimePurchase) {
      throw new HttpException(
        'User has previously made a purchase',
        HttpStatus.BAD_REQUEST,
      );
    }
    const referrer = await this.prisma.user.findUnique({
      where: { userCode },
    });
    if (referrer) {
      await this.prisma.referral.create({
        data: { userId, referrerId: referrer.id },
      });
      return this.getApplicableBonus(userId, purchaseAmount);
    } else {
      return this.applyAffiliateCode(userId, userCode, purchaseAmount);
    }
  }

  async applyAffiliateCode(
    userId: string,
    affiliateCode: string,
    purchaseAmount: number,
  ) {
    const affiliate = await this.getAffiliate(affiliateCode);
    if (!affiliate) {
      throw new HttpException('Invalid code', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.referral.create({
      data: {
        userId,
        affiliateId: affiliate.id,
        type: ReferralType.AFFILIATE,
      },
    });
    if (affiliate.rewardType === AffiliateRewardType.CREDIT) {
      const bonusAmount = this.calculateAffiliateBonus(
        +affiliate.rewardAmount,
        purchaseAmount,
      );
      const bonusAmountInCC = this.poundsToCC(bonusAmount);
      return {
        type: 'credits',
        amount: bonusAmount,
        amount_in_cc: bonusAmountInCC,
      };
    } else if (affiliate.rewardType === AffiliateRewardType.FREE_MONTH) {
      return {
        type: 'free_subscription',
        duration_in_months: +affiliate.rewardAmount,
      };
    }
    throw new HttpException('Invalid referral code', HttpStatus.BAD_REQUEST);
  }

  async getApplicableBonus(userId: string, purchaseAmount: number) {
    const referral = await this.getReferral(userId);
    if (!referral) {
      return null;
    }
    const referrer = await this.prisma.user.findUnique({
      where: { id: referral.referrerId },
      select: { firstPaymentDate: true },
    });
    if (!referrer?.firstPaymentDate) {
      return null;
    }
    const referralCount = await this.countReferrals(referral.referrerId);
    const totalSubscriptionDuration = await this.checkFreeSubscriptionDuration(
      referral.referrerId,
      referrer.firstPaymentDate,
    );
    const { isEarly: isEarlyUser } = await this.usersService.isEarlyUser();
    const isFirst30Days = await this.usersService.isUserFirst30Days(
      referral.referrerId,
    );
    if (
      isEarlyUser &&
      isFirst30Days &&
      referralCount <= 3 &&
      totalSubscriptionDuration < 2
    ) {
      return {
        type: 'free_subscription',
        duration_in_months: isEarlyUser ? 12 : 6,
      };
    }
    const bonusAmount = this.calculateReferralBonus(purchaseAmount);
    const bonusAmountInCC = this.poundsToCC(bonusAmount);
    return {
      type: 'credits',
      amount: bonusAmount,
      amount_in_cc: bonusAmountInCC,
    };
  }

  private async sendCoinEarnedEmail(
    sponsor: {
      id: string;
      email: string;
      firstName: string;
      refCode: string;
      userCode: string;
    },
    bonusAmountInCC: number,
  ) {
    try {
      // Get sponsor's wallet balance for totalCoins
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId: sponsor.id },
      });
      const totalCoins = +(wallet?.balance || 0);

      // Create referral link
      const referralLink = `${this.parameters.SUPPLEMENT_EMAIL_URL}?ref=${sponsor.refCode}`;
      const dashboardLink = `${this.parameters.SUPPLEMENT_EMAIL_URL}/dashboard`;

      // Send the email
      await this.courierService.sendCoinEarnedMail(
        sponsor.email,
        sponsor.firstName,
        referralLink,
        sponsor.userCode,
        bonusAmountInCC,
        totalCoins,
        this.ccToPounds(totalCoins),
        dashboardLink,
      );
    } catch (error) {
      this.logger.error('Failed to send coin earned email to sponsor', {
        sponsorId: sponsor.id,
        error,
      });
      // Don't throw the error to avoid breaking the main referral flow
    }
  }

  async getAffiliate(code: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { code },
    });
    return affiliate;
  }
  async getAffiliateById(id: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { id },
    });
    return affiliate;
  }
  async applyAffiliateBonus({
    userId,
    affiliateId,
    purchaseAmount,
    orderId,
  }: {
    userId: string;
    affiliateId: string;
    purchaseAmount: number;
    orderId: string;
  }) {
    const affiliate = await this.getAffiliateById(affiliateId);
    if (!affiliate) {
      this.logger.error('Affiliate not found %o', {
        userId,
        affiliateId,
        orderId,
      });
      return;
    }
    if (affiliate.rewardType === AffiliateRewardType.CREDIT) {
      this.logger.info('Applying affiliate credit bonus %o', {
        userId,
        affiliateId,
        orderId,
        purchaseAmount,
      });
      const bonusAmount = this.calculateAffiliateBonus(
        +affiliate.rewardAmount,
        purchaseAmount,
      );
      const bonusAmountInCC = this.poundsToCC(bonusAmount);
      await this.handleBonus({
        userId,
        amount: bonusAmountInCC,
        type: BonusType.AFFILIATE_REFERRAL,
        orderId,
        category: 'affiliate credit',
      });
    } else if (affiliate.rewardType === AffiliateRewardType.FREE_MONTH) {
      this.logger.info('Applying affiliate free month bonus %o', {
        userId,
        affiliateId,
        orderId,
        duration: `${affiliate.rewardAmount} months`,
      });
      await this.applyFreeSubscriptionBonus({
        userId,
        orderId,
        duration: +affiliate.rewardAmount,
        category: 'affiliate free month',
        type: BonusType.AFFILIATE_REFERRAL,
      });
    }
  }
  calculateAffiliateBonus(rewardPercentage: number, purchaseAmount: number) {
    return (rewardPercentage / 100) * purchaseAmount;
  }
}
