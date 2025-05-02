import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BonusDto, ClaimCCDto } from './dto/referrals.dto';
import { PrismaService } from '../prisma.service';
import crypto from 'crypto';
import { BonusType, PaymentStatus, ReferralType } from '@prisma/client';
import { UsersService } from '../users/users.service';
import Rollbar from 'rollbar';
import Stripe from 'stripe';
import { Logger } from 'winston';
import {
  CC_TO_POUNDS_RATE,
  MINIMUM_STRIPE_AMOUNT_IN_PENCE,
  REFERRAL_BONUS_PERCENTAGE,
} from '../utils/constants';
import { addMonths, differenceInYears } from 'date-fns';
import { Prisma } from '@prisma/client';
@Injectable()
export class ReferralsService {
  private static readonly CODE_LENGTH = 6;
  private static readonly USER_CODE_LENGTH = 3;
  private static readonly CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  private readonly stripe: Stripe;
  private static readonly MINIMUM_CREDIT_AMOUNT = 500; // £5 in pence

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    @Inject('ROLLBAR') private readonly rollbar: Rollbar,
    @Inject('LOGGER') private readonly logger: Logger,
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
  ) {
    this.stripe = new Stripe(this.parameters.SUPPLEMENT_STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

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
  async handleReferral(metadata: Stripe.Metadata, amount: number) {
    const { order_id, user_id } = metadata;
    const user = await this.usersService.findUser({ id: user_id });
    if (!user) {
      this.logger.error('REFERRAL: User not found', { user_id });
      this.rollbar.error('REFERRAL: User not found', { user_id });
      return;
    }
    const firstTimePurchase = await this.isFirstTimePurchase(
      user_id,
      metadata,
      amount,
    );
    if (!firstTimePurchase) {
      return;
    }
    const referral = await this.getReferral(user_id);
    if (!referral) {
      return;
    }
    if (referral.type === ReferralType.AFFILIATE) {
      // TODO: Handle affiliate referral bonus
      return;
    }
    const bonusAmount = this.calculateReferralBonus(+firstTimePurchase);
    this.logger.info(
      'PAYMENT WEBHOOK: Calculated referral bonus: %s',
      bonusAmount,
    );
    const bonusAmountInCC = this.poundsToCC(bonusAmount);
    const isEarlyUser = await this.usersService.isEarlyUser();
    const isFirst30Days = await this.usersService.isUserFirst30Days(
      referral.referrerId,
    );
    if (isEarlyUser && isFirst30Days) {
      await this.applyFirst30DaysReferralBonus(
        referral.referrerId,
        order_id,
        bonusAmountInCC,
      );
      return;
    }

    await this.handleBonus({
      userId: user_id,
      amount: bonusAmountInCC,
      type: BonusType.SIGNUP,
      orderId: order_id,
    });
    const sponsor = await this.usersService.findUser({
      id: referral.referrerId,
    });
    if (!sponsor) {
      this.logger.error(
        'PAYMENT WEBHOOK: User with referrerId %s not found: %o',
        referral.referrerId,
        metadata,
      );
      this.rollbar.error(
        'PAYMENT WEBHOOK: User with referrerId %s not found: %o',
        referral.referrerId,
        metadata,
      );
      return;
    }
    await this.handleBonus({
      userId: sponsor.id,
      amount: bonusAmountInCC,
      type: BonusType.REFERRAL,
      referralId: user_id,
      orderId: order_id,
    });
  }

  async applyFirst30DaysReferralBonus(
    referrerId: string,
    order_id: string,
    bonusAmount: number,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: referrerId },
          select: { firstPaymentDate: true },
        });
        if (!user?.firstPaymentDate) {
          this.logger.error('User not found', { referrerId });
          return;
        }

        if (!user?.firstPaymentDate) {
          return;
        }

        const subscription = await tx.subscription.findFirst({
          where: { userId: referrerId },
        });
        if (!subscription) {
          this.logger.error('Subscription not found', { referrerId });
          return;
        }

        const totalSubscriptionDuration = differenceInYears(
          new Date(subscription.expiryDate),
          new Date(user.firstPaymentDate),
        );

        if (totalSubscriptionDuration >= 1) {
          await this.handleBonus({
            userId: referrerId,
            amount: bonusAmount,
            type: BonusType.REFERRAL,
            orderId: order_id,
          });
          return;
        }
        await Promise.all([
          tx.subscription.update({
            where: { id: subscription.id },
            data: {
              expiryDate: addMonths(new Date(subscription.expiryDate), 6),
            },
          }),
          tx.bonus.create({
            data: {
              userId: referrerId,
              amount: 0,
              type: BonusType.REFERRAL,
              category: '6 months free subscription',
              orderId: order_id,
            },
          }),
        ]);
      });
    } catch (error) {
      this.logger.error('Failed to apply referral bonus', {
        referrerId,
        order_id,
        error,
      });
      throw new HttpException(
        'Failed to apply referral bonus',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      `PAYMENT WEBHOOK: Updating wallet for user ${userId} with amount ${amount}`,
    );
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      this.logger.info(
        'PAYMENT WEBHOOK: User %s has no wallet, creating one...',
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
      `PAYMENT WEBHOOK: Updated wallet for user ${userId} with amount ${amount}`,
    );
  }

  async isFirstTimePurchase(
    userId: string,
    metadata: Stripe.Metadata,
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
        'PAYMENT WEBHOOK: User has no payments: %s: %o',
        userId,
        metadata,
      );
      return amount;
    }
    if (payments.length > 1) {
      this.logger.info(
        'PAYMENT WEBHOOK: User has more than one payment. Exiting...: %s: %o',
        userId,
        metadata,
      );
      this.rollbar.info(
        'PAYMENT WEBHOOK: User has more than one payment. Exiting...: %s: %o',
        userId,
        metadata,
      );
      return false;
    }
    return payments[0].amount;
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
      this.rollbar.error('No Reward category matches the specified rewardId', {
        userId,
        rewardId,
      });
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
    const referrer = await this.getReferrer(userId);
    return {
      referralCode: user.refCode,
      userCode: user.userCode,
      teams: user._count.teams,
      wallet,
      totalSaved: totalSaved._sum.amount,
      claims,
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
    const coupon = await this.stripe.coupons.create({
      amount_off: amount * 100,
      duration: 'once',
      currency: 'GBP',
      metadata: {
        userId,
      },
    });
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
          };
        }
        return {
          amount: +item.amount,
          type: item.type,
          userTeam: item.order?.team?.name,
          createdAt: item.createdAt,
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
  async handleRefCodeAndFreeTrial(
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    await this.createReferralCodes(userId, tx);
    await this.createFreeTrialSubscription(userId, tx);
  }

  async createReferralCodes(userId: string, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;
    const user = await this.usersService.findUser({ id: userId });
    if (!user) {
      this.logger.error('REFERRAL CODE: User not found', { userId });
      return;
    }
    const referralCode = await this.generateReferralCode();
    const userCode = await this.generateUserCode(user.firstName);
    await prisma.user.update({
      where: { id: userId },
      data: { refCode: referralCode, userCode },
    });
  }
  async createFreeTrialSubscription(
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const earlyUser = await this.usersService.isEarlyUser();
    const prisma = tx || this.prisma;

    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId },
    });

    if (existingSubscription) {
      this.logger.warn('User already has a subscription', { userId });
      return;
    }

    const existingBonus = await prisma.bonus.findFirst({
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

    await Promise.all([
      prisma.subscription.create({
        data: {
          userId,
          expiryDate: addMonths(new Date(), earlyUser ? 12 : 6),
        },
      }),
      prisma.bonus.create({
        data: {
          userId,
          amount: 0,
          type: BonusType.FREE_TRIAL,
          category: earlyUser
            ? '1 year free subscription'
            : '6 months free subscription',
        },
      }),
    ]);
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
    const affiliate = true; // TODO: call affiliate service
    if (affiliate) {
      await this.prisma.referral.create({
        data: { userId, affiliateId: refCode, type: ReferralType.AFFILIATE },
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
}
