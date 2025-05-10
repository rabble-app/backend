import { Injectable, Inject } from '@nestjs/common';
import { ICourierClient } from '@trycourier/courier';
import { courier } from '../utils/mail';

@Injectable()
export class CourierService {
  private readonly courierClient: ICourierClient;

  constructor(
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
  ) {
    this.courierClient = courier(this.parameters.COURIER_API);
  }

  async sendEmailVerification(email: string, url: string) {
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.EMAIL_VERIFICATION_TEMPLATE,
        data: {
          url,
        },
      },
    });
  }

  async sendPasswordReset(email: string, url: string) {
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.RESET_PASSWORD_TEMPLATE,
        data: {
          url,
        },
      },
    });
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    await this.courierClient.send({
      message: {
        to: {
          email,
        },
        template: this.parameters.WELCOME_EMAIL_TEMPLATE,
        data: {
          firstName,
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
