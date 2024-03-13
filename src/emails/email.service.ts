import { Inject, Injectable } from '@nestjs/common';
import * as AWS from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class EmailService {
  constructor(
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
  ) {}

  getSesClient() {
    return new AWS.SESClient({
      region: this.parameters.RABBLE_AWS_REGION,
      credentials: {
        accessKeyId: this.parameters.RABBLE_AWS_ACCESS_KEY_ID,
        secretAccessKey: this.parameters.RABBLE_AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  getTransporter() {
    const ses = new AWS.SES({
      region: this.parameters.RABBLE_AWS_REGION,
      apiVersion: '2010-12-01',
      credentials: {
        accessKeyId: this.parameters.RABBLE_AWS_ACCESS_KEY_ID,
        secretAccessKey: this.parameters.RABBLE_AWS_SECRET_ACCESS_KEY,
      },
    });
    return nodemailer.createTransport({
      SES: {
        ses,
        aws: AWS,
      },
    });
  }

  async sendEmail(options: Mail.Options) {
    return this.getTransporter().sendMail(options);
  }

  getOrderEmailOptions() {
    const fromPrefix = 'Rabble Marketplace';
    const isProduction = this.parameters.APP_ENV === 'production';
    return {
      from: isProduction
        ? `${fromPrefix} <orders@rabble.market>`
        : `${fromPrefix} <orders@dev.rabble.market>`,
      replyTo: isProduction
        ? 'orders@rabble.market'
        : 'orders@dev.rabble.market',
      ...(isProduction && { bcc: 'rabble.d679@app.hubdoc.com' }),
    };
  }
}
