import { existsSync, readFileSync } from 'node:fs';
import path from 'path';

import { logger } from '@user-office-software/duo-logger';
import EmailTemplates from 'email-templates';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import pug from 'pug';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { AdminDataSource } from '../../datasources/AdminDataSource';
import { EmailTemplateDataSource } from '../../datasources/EmailTemplateDataSource';
import { SettingsId } from '../../models/Settings';
import { isProduction } from '../../utils/helperFunctions';
import EmailSettings from './EmailSettings';
import { ELIEmailTemplate, MailService, SendMailResults } from './MailService';
import { ResultsPromise } from './SparkPost';

export class SMTPMailService extends MailService {
  private emailTemplate: EmailTemplates<any>;
  private emailTemplateDataSource: EmailTemplateDataSource;

  constructor() {
    super();

    logger.logInfo('Initializing SMTPMailService', {});

    this.emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
      Tokens.EmailTemplateDataSource
    );

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

    this.emailTemplate = new EmailTemplates({
      message: {
        from: process.env.EMAIL_SENDER,
        attachments,
      },
      send: true,
      transport: smtpTransport,
      juice: true,
      juiceResources: {
        webResources: {
          relativeTo: path.resolve(process.env.EMAIL_TEMPLATE_PATH || ''),
        },
      },
      render: (view: string, locals?: any) => {
        return new Promise((resolve, reject) => {
          const lastSlashIndex = view.lastIndexOf('/');
          const templateBody =
            lastSlashIndex !== -1 ? view.substring(0, lastSlashIndex) : view;

          this.emailTemplate
            .juiceResources(templateBody)
            .then((html) => {
              resolve(html);
            })
            .catch((err) => {
              reject(err);
            });
        });
      },
    });
  }

  private getEmailTemplatePath(type: string, template: string): string {
    return path.join(
      process.env.EMAIL_TEMPLATE_PATH || '',
      `${template}.${type}`
    );
  }

  private async getEmailTemplate(options: EmailSettings): Promise<{
    subject: string;
    body: string;
  } | null> {
    if (process.env.NODE_ENV === 'test') {
      return { subject: '= ``', body: '' };
    }

    let templateBody = '';
    let templateSubject = '';

    const emailTemplate =
      await this.emailTemplateDataSource.getEmailTemplateByName(
        options.content.template
      );

    if (emailTemplate) {
      templateBody = emailTemplate.body;
      templateSubject = emailTemplate.subject;
    } else {
      const templateBodyPath =
        this.getEmailTemplatePath('html', options.content.template) + '.pug';
      const templateSubjectPath =
        this.getEmailTemplatePath('subject', options.content.template) + '.pug';

      try {
        templateBody = readFileSync(templateBodyPath, 'utf-8');
        templateSubject = readFileSync(templateSubjectPath, 'utf-8');
      } catch (error) {
        logger.logError('Email template file not found', {
          error: error,
        });

        return null;
      }
    }

    return {
      subject: pug.render(templateSubject, {}),
      body: pug.render(templateBody, options.substitution_data || {}),
    };
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

  async sendMail(options: EmailSettings): ResultsPromise<SendMailResults> {
    const adminDataSource = container.resolve<AdminDataSource>(
      Tokens.AdminDataSource
    );

    const bccAddress = (
      await adminDataSource.getSetting(SettingsId.SMTP_BCC_EMAIL)
    )?.settingsValue;

    const emailPromises: Promise<SendMailResults>[] = [];

    const sendMailResults: SendMailResults = {
      total_rejected_recipients: 0,
      total_accepted_recipients: 0,
      id: Math.random().toString(36).substring(7),
    };

    if (process.env.NODE_ENV === 'test') {
      sendMailResults.id = 'test';
    }

    const template = await this.getEmailTemplate(options);

    if (!template) {
      logger.logError('Email template not found', {
        template: options.content.template,
      });

      return { results: sendMailResults };
    }

    if (process.env.SKIP_SMTP_EMAIL_SENDING === 'true') {
      logger.logInfo('Skipping email sending', {
        template: options.content.template,
      });

      return { results: sendMailResults };
    }

    options.recipients.forEach((participant) => {
      const emailOptions = {
        message: {
          ...(typeof participant.address !== 'string'
            ? {
                to: {
                  address: isProduction
                    ? participant.address?.email
                    : <string>process.env.SINK_EMAIL,
                  name: participant.address?.header_to,
                },
                bcc: bccAddress,
                subject: template.subject,
              }
            : {
                to: isProduction
                  ? participant.address
                  : <string>process.env.SINK_EMAIL,
                bcc: bccAddress,
                subject: template.subject,
              }),
        },
        locals: options.substitution_data,
        template: template.body,
      };

      emailPromises.push(this.emailTemplate.send(emailOptions));
    });

    return Promise.allSettled(emailPromises).then((results) => {
      results.forEach((result) => {
        if (result.status === 'rejected') {
          logger.logError('Unable to send email to user', {
            error: result.reason,
          });
          sendMailResults.total_rejected_recipients++;
        } else {
          sendMailResults.total_accepted_recipients++;
        }
      });

      return sendMailResults.total_rejected_recipients > 0
        ? Promise.reject({ results: sendMailResults })
        : Promise.resolve({ results: sendMailResults });
    });
  }

  async getEmailTemplates(): ResultsPromise<ELIEmailTemplate[]> {
    const emailTemplates =
      await this.emailTemplateDataSource.getEmailTemplates();

    return {
      results: emailTemplates.emailTemplates.map((template) => ({
        id: template.id,
        name: template.name || '',
      })),
    };
  }
}
