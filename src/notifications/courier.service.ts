import { Injectable, Inject } from '@nestjs/common';
import { ICourierClient } from '@trycourier/courier';
import { courier } from '../utils/mail';
import { Logger } from 'winston';

@Injectable()
export class CourierService {
  private readonly courierClient: ICourierClient;

  constructor(
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
    @Inject('LOGGER') private readonly logger: Logger,
  ) {
    this.courierClient = courier(this.parameters.SUPPLEMENT_COURIER_API);
  }

  async sendEmailVerification(email: string, url: string) {
    this.logger.info('Sending email verification to user %o', { email, url });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_EMAIL_CONFIRMATION_TEMPLATE,
        data: {
          url,
        },
      },
    });
  }

  async sendWelcomeEmail(email: string, firstName: string, productName: string, quarterAmount: number, unitOfMeasure: string, price: string, referralLink: string, discountCode: string, dashboardUrl: string) {
    this.logger.info('Sending welcome email to user %o', { email, firstName, productName, quarterAmount, unitOfMeasure, price, referralLink, discountCode, dashboardUrl });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_WELCOME_EMAIL_TEMPLATE,
        data: {
          first_name: firstName,
          product_name: productName,
          product_quarter_amount: `${quarterAmount} ${unitOfMeasure}`,
          price,
          referral_link: referralLink,
          discount_code: discountCode,
          dashboard_link: dashboardUrl,
        },
      },
    });
  }

  async sendSubscriptionUpdateEmail(email: string, firstName: string, productName: string, quarterAmount: number, unitOfMeasure: string, price: string, nextEditableDropDate: string, manageSubscriptionUrl: string) {
    this.logger.info('Sending subscription update email to user %o', { email, firstName, productName, quarterAmount, unitOfMeasure, price, nextEditableDropDate, manageSubscriptionUrl });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_SUBSCRIPTION_UPDATE_TEMPLATE,
        data: {
          first_name: firstName,
          product_name: productName,
          new_quantity: `${quarterAmount} ${unitOfMeasure}`,
          new_price: parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          next_editable_drop_date: nextEditableDropDate,
          manage_subscription_url: manageSubscriptionUrl,
        },
      },
    });
  }

  async sendSubscriptionCancelledEmail(email: string, firstName: string, productName: string, effectiveCancellationDate: string, productsUrl: string, productUrl: string) {
    this.logger.info('Sending subscription cancelled email to user %o', { email, firstName, productName, effectiveCancellationDate, productsUrl, productUrl });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_SUBSCRIPTION_CANCEL_TEMPLATE,
        data: {
          first_name: firstName,
          product_name: productName,
          cancellation_effective_date: effectiveCancellationDate,
          products_url: productsUrl,
          product_url: productUrl,
        },
      },
    });
  }

  async sendMembershipCancelledEmail(email: string, firstName: string, membershipEndDate: string, reactivateMembershipUrl: string) {
    this.logger.info('Sending membership cancelled email to user %o', { email, firstName, membershipEndDate, reactivateMembershipUrl });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_MEMBERSHIP_CANCEL_TEMPLATE,
        data: {
          first_name: firstName,
          membership_end_date: membershipEndDate,
          reactivate_membership_url: reactivateMembershipUrl,
        },
      },
    });
  }

  async sendPasswordReset(email: string, firstName: string, url: string) {
    this.logger.info('Sending password reset email to user %o', { email, firstName, url });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_FORGOT_PASSWORD_TEMPLATE,
        data: {
          first_name: firstName,
          url,
        },
      },
    });
  }

  async sendMagicLink(email: string, magicLink: string) {
    this.logger.info('Sending magic link email to user %o', { email });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.MAGIC_LINK_TEMPLATE,
        data: {
          magicLink,
        },
      },
    });
  }

  async sendLastDayOfFreeMembershipBonus(email: string, firstName: string, referralLink: string, referralCode: string) {
    this.logger.info('Sending last day of free membership bonus email to user %o', { email, firstName, referralLink, referralCode });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_LAST_DAY_OF_30DAYS_TEMPLATE,
        data: {
          first_name: firstName,
          referral_link: referralLink,
          referral_code: referralCode,
        },
      },
    });
  }

  async send30DaysMidWayReminder(email: string, firstName: string, referralLink: string, referralCode: string) {
    this.logger.info('Sending 30 days midway reminder email to user %o', { email, firstName, referralLink, referralCode });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_30DAYS_MID_WAY_TEMPLATE,
        data: {
          first_name: firstName,
          referral_link: referralLink,
          referral_code: referralCode,
        },
      },
    });
  }

  async sendLast3DaysOf30DaysReminder(email: string, firstName: string, referralLink: string, referralCode: string) {
    this.logger.info('Sending last 3 days of 30 days reminder email to user %o', { email, firstName, referralLink, referralCode });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_LAST_3DAYs_OF_30DAYS_TEMPLATE,
        data: {
          first_name: firstName,
          referral_link: referralLink,
          referral_code: referralCode,
        },
      },
    });
  }

  async sendCoinEarnedMail(email: string, firstName: string, referralLink: string, referralCode: string, coinsAmount: number, totalCoins: number, coinValue: number, dashboardLink: string) {
    this.logger.info('Sending coin earned email to user %o', { email, firstName, coinsAmount, totalCoins, referralLink, referralCode, dashboardLink });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_COIN_EARNED_TEMPLATE,
        data: {
          first_name: firstName,
          referral_link: referralLink,
          referral_code: referralCode,
          coins_earned: coinsAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          total_coins: totalCoins.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          coin_value: coinValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          dashboard_link: dashboardLink,
        },
      },
    });
  }

  async sendReferralFreeMonthMail(email: string, firstName: string, daysLeft: string, referralCode: string, referralLink: string, dashboardLink: string) {
    this.logger.info('Sending referral free month email to user %o', { email, firstName, daysLeft, referralCode, referralLink, dashboardLink });
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.SUPPLEMENT_COURIER_REFERRAL_FREE_MONTH_TEMPLATE,
        data: {
          first_name: firstName,
          days_left: daysLeft,
          referral_link: referralLink,
          referral_code: referralCode,
          dashboard_link: dashboardLink,
        },
      },
    });
  }
}
