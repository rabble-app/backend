import * as nodemailer from 'nodemailer';

const mailTransport = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.NEXT_PUBLIC_MAIL_USERNAME,
    pass: process.env.NEXT_PUBLIC_MAIL_PASSWORD,
  },
});

export default mailTransport;
