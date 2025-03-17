import EmailTemplates from 'email-templates';
import * as nodemailer from 'nodemailer';

import { NodeMailerMailService } from './NodeMailerMailService';

export class SMTPMailService extends NodeMailerMailService {
  constructor() {
    super();
  }

  protected createTransport(): EmailTemplates.NodeMailerTransportOptions {
    return nodemailer.createTransport({
      host: process.env.EMAIL_AUTH_HOST,
      port: parseInt(process.env.EMAIL_AUTH_PORT || '25'),
      ...this.getSmtpAuthOptions(),
    });
  }

  private getSmtpAuthOptions() {
    if (process.env.EMAIL_AUTH_USERNAME && process.env.EMAIL_AUTH_PASSWORD) {
      return {
        auth: {
          user: process.env.EMAIL_AUTH_USERNAME,
          pass: process.env.EMAIL_AUTH_PASSWORD,
        },
      };
    }

    return {
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    };
  }
}
