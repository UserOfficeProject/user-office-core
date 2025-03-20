import EmailTemplates from 'email-templates';
import * as nodemailer from 'nodemailer';

import { NodeMailerMailService } from './NodeMailerMailService';

export class SMTPMailService extends NodeMailerMailService {
  constructor() {
    super();
  }

  protected createTransport(): EmailTemplates.NodeMailerTransportOptions {
    if (process.env.EMAIL_USE_POOL && process.env.EMAIL_MAX_CONNECTIONS) {
      return nodemailer.createTransport({
        pool: true,
        maxConnections: parseInt(process.env.EMAIL_MAX_CONNECTIONS || '5'),
        host: process.env.EMAIL_AUTH_HOST,
        port: parseInt(process.env.EMAIL_AUTH_PORT || '25'),
        ...this.getSmtpAuthOptions(),
      });
    }

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
