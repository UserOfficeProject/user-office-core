import { existsSync } from 'node:fs';

import { logger } from '@user-office-software/duo-logger';
import { NodeMailerTransportOptions } from 'email-templates';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { TemplateMailService } from '../TemplateMailService';

export class SMTPMailService extends TemplateMailService {
  constructor() {
    super();

    logger.logInfo('Initializing SMTPMailService', {
      host: process.env.EMAIL_AUTH_HOST,
      port: process.env.EMAIL_AUTH_PORT,
      user: process.env.EMAIL_AUTH_USERNAME,
    });
  }

  protected createTransport(): NodeMailerTransportOptions {
    let smtpTransport:
      | Transporter<SMTPPool.SentMessageInfo>
      | Transporter<SMTPTransport.SentMessageInfo>;

    if (process.env.EMAIL_USE_POOL && process.env.EMAIL_MAX_CONNECTIONS) {
      smtpTransport = nodemailer.createTransport({
        pool: true,
        maxConnections: parseInt(process.env.EMAIL_MAX_CONNECTIONS || '5'),
        host: process.env.EMAIL_AUTH_HOST,
        port: parseInt(process.env.EMAIL_AUTH_PORT || '25'),
        ...this.getSmtpAuthOptions(),
      });
    } else {
      smtpTransport = nodemailer.createTransport({
        host: process.env.EMAIL_AUTH_HOST,
        port: parseInt(process.env.EMAIL_AUTH_PORT || '25'),
        ...this.getSmtpAuthOptions(),
      });
    }

    return smtpTransport;
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

  protected createAttachments(): any[] {
    const attachments = [];

    if (process.env.EMAIL_FOOTER_IMAGE_PATH !== undefined) {
      if (existsSync(process.env.EMAIL_FOOTER_IMAGE_PATH)) {
        attachments.push({
          filename: 'logo.png',
          path: process.env.EMAIL_FOOTER_IMAGE_PATH,
          cid: 'logo1',
        });
      } else {
        logger.logWarn('Email footer image path does not exist', {
          path: process.env.EMAIL_FOOTER_IMAGE_PATH,
        });
      }
    }

    return attachments;
  }
}
