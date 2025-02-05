import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BonusDto, ClaimCCDto } from './dto/referrals.dto';
import { PrismaService } from '../prisma.service';
import crypto from 'crypto';
import { BonusType, PaymentStatus } from '@prisma/client';
import { UsersService } from '../users/users.service';
import Rollbar from 'rollbar';
import Stripe from 'stripe';
import { Logger } from 'winston';
import {
  CC_TO_POUNDS_RATE,
  REFERRAL_BONUS_PERCENTAGE,
} from '../utils/constants';
@Injectable()
export class ReferralsService {
  private static readonly CODE_LENGTH = 6;
  private static readonly CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  private readonly stripe: Stripe;
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    @Inject('ROLLBAR') private readonly rollbar: Rollbar,
    @Inject('LOGGER') private readonly logger: Logger,
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
  ) {
    this.stripe = new Stripe(this.parameters.STRIPE_SECRET_KEY, {
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
  private generateRandomCode(): string {
    let code = '';
    for (let i = 0; i < ReferralsService.CODE_LENGTH; i++) {
      const randomIndex = crypto.randomInt(
        0,
        ReferralsService.CHARACTERS.length,
      );
      code += ReferralsService.CHARACTERS[randomIndex];
    }
    return code;
  }
  async handleReferral(metadata: Stripe.Metadata) {
    const { order_id, user_id } = metadata;
    const user = await this.prisma.user.findUnique({
      where: { id: user_id },
    });
    if (!user) {
      this.logger.error('PAYMENT WEBHOOK: User not found: %o', metadata);
      this.rollbar.error('PAYMENT WEBHOOK: User not found: %o', metadata);
      return;
    }
    const firstTimePurchase = await this.isFirstTimePurchase(user_id, metadata);
    if (!firstTimePurchase) {
      return;
    }
    const bonusAmount = this.calculateReferralBonus(+firstTimePurchase.amount);
    this.logger.info(
      'PAYMENT WEBHOOK: Calculated referral bonus: %s',
      bonusAmount,
    );
    const bonusAmountInCC = this.poundsToCC(bonusAmount);
    const referralCode = await this.generateReferralCode();
    await Promise.all([
      this.usersService.updateUser({
        where: { id: user_id },
        data: { refCode: referralCode },
      }),
      this.handleBonus({
        userId: user_id,
        amount: bonusAmountInCC,
        type: BonusType.SIGNUP,
        orderId: order_id,
      }),
    ]);

    if (!user.referrerId) {
      this.logger.info('PAYMENT WEBHOOK: User has no referrerId: %o', metadata);
      this.rollbar.info(
        'PAYMENT WEBHOOK: User has no referrerId: %o',
        metadata,
      );
      return;
    }
    const sponsor = await this.prisma.user.findUnique({
      where: { id: user.referrerId },
    });
    if (!sponsor) {
      this.logger.error(
        'PAYMENT WEBHOOK: User with referrerId %s not found: %o',
        user.referrerId,
        metadata,
      );
      this.rollbar.error(
        'PAYMENT WEBHOOK: User with referrerId %s not found: %o',
        user.referrerId,
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

  async isFirstTimePurchase(userId: string, metadata: Stripe.Metadata) {
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
      this.rollbar.info(
        'PAYMENT WEBHOOK: User has no payments: %s: %o',
        userId,
        metadata,
      );
      return false;
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
    return payments[0];
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
    const coupon = await this.createRewardCoupon(
      userId,
      reward.amount,
      reward.rate,
    );
    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: reward.amount },
          claimed: { increment: reward.amount },
        },
      }),
      this.prisma.claim.create({
        data: {
          userId,
          amount: reward.amount,
          couponId: coupon.id,
          couponValue: coupon.amount_off / 100,
        },
      }),
    ]);
    return { coupon: coupon.id, couponValue: coupon.amount_off / 100 };
  }

  getRewardCouponValue(rewardAmount: number, rewardRate: number) {
    return rewardAmount / rewardRate;
  }

  async createRewardCoupon(
    userId: string,
    rewardAmount: number,
    rewardRate: number,
  ) {
    const couponValue =
      this.getRewardCouponValue(rewardAmount, rewardRate) * 100;
    const coupon = await this.stripe.coupons.create({
      amount_off: couponValue,
      duration: 'once',
      currency: 'GBP',
      metadata: {
        userId,
        ccClaimed: rewardAmount,
      },
    });
    return coupon;
  }

  async getUnusedCoupons(userId: string) {
    const claims = await this.prisma.claim.findMany({
      where: { userId, used: false },
    });
    if (!claims.length) {
      return;
    }
    return claims.reduce(
      (acc, claim) => {
        acc.couponValue += +claim.couponValue;
        acc.couponIds.push(claim.couponId);
        return acc;
      },
      { couponValue: 0, couponIds: [] },
    );
  }

  async markClaimsAsUsed(couponIds: string[]) {
    await this.prisma.claim.updateMany({
      where: { couponId: { in: couponIds } },
      data: { used: true },
    });
  }

  async getReferralInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        refCode: true,
        referrerId: true,
        _count: {
          select: {
            teams: true,
          },
        },
      },
    });
    if (!user && !user.refCode) {
      this.logger.info('REFERRAL INFO: User has no referral code %o', {
        userId,
      });
      this.rollbar.info('REFERRAL INFO: User has no referral code %o', {
        userId,
      });
      return;
    }
    const code = user.refCode;
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    const bonuses = await this.prisma.bonus.findMany({
      where: { userId },
    });
    const claims = await this.prisma.claim.findMany({
      where: { userId },
    });

    const totalSaved = claims
      .filter((c) => c.used)
      .reduce((acc, claim) => acc + +claim.couponValue, 0);
    const referrer = user.referrerId
      ? await this.prisma.user.findUnique({
          where: { id: user.referrerId },
        })
      : null;
    return {
      referralCode: code,
      teams: user._count.teams,
      wallet,
      bonuses,
      totalSaved,
      claims,
      ...(referrer && {
        referrer: {
          id: referrer.id,
          name: `${referrer.firstName} ${referrer.lastName}`,
        },
      }),
    };
  }

  async getRewardCategories() {
    return await this.prisma.reward.findMany();
  }
}
