import { Injectable, Inject } from '@nestjs/common';
import { ICourierClient } from '@trycourier/courier';
import { courier } from '../utils/mail';

@Injectable()
export class CourierService {
  private readonly courierClient: ICourierClient;

  constructor(
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
  ) {
    this.courierClient = courier(this.parameters.SUPPLEMENT_COURIER_API);
  }

  async sendEmailVerification(email: string, url: string) {
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
          new_price: price,
          next_editable_drop_date: nextEditableDropDate,
          manage_subscription_url: manageSubscriptionUrl,
        },
      },
    });
  }

  async sendSubscriptionCancelledEmail(email: string, firstName: string, productName: string, effectiveCancellationDate: string, productsUrl: string, productUrl: string) {
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
}
