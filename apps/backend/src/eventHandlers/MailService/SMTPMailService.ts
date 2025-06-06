import path from 'path';

import { logger } from '@user-office-software/duo-logger';
import EmailTemplates from 'email-templates';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { AdminDataSource } from '../../datasources/AdminDataSource';
import { SettingsId } from '../../models/Settings';
import { isProduction } from '../../utils/helperFunctions';
import EmailSettings from './EmailSettings';
import { MailService, STFCEmailTemplate, SendMailResults } from './MailService';
import { ResultsPromise } from './SparkPost';

export class SMTPMailService extends MailService {
  private emailTemplates: EmailTemplates<any>;

  constructor() {
    super();

    const attachments = [];

    if (process.env.EMAIL_FOOTER_IMAGE_PATH !== undefined) {
      attachments.push({
        filename: 'logo.png',
        path: process.env.EMAIL_FOOTER_IMAGE_PATH,
        cid: 'logo1',
      });
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

    this.emailTemplates = new EmailTemplates({
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
      getPath: this.getEmailTemplatePath,
    });
  }

  private getEmailTemplatePath(type: string, template: string): string {
    return path.join(
      process.env.EMAIL_TEMPLATE_PATH || '',
      `${template}.${type}`
    );
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

    const template =
      this.getEmailTemplatePath('html', options.content.template_id) + '.pug';

    if (
      !(await (this.emailTemplates as any).templateExists(template)) &&
      process.env.NODE_ENV !== 'test'
    ) {
      logger.logError('Template does not exist', {
        templateId: template,
      });

      return { results: sendMailResults };
    }

    options.recipients.forEach((participant) => {
      emailPromises.push(
        this.emailTemplates.send({
          template: options.content.template_id,
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
                }
              : {
                  to: isProduction
                    ? participant.address
                    : <string>process.env.SINK_EMAIL,
                  bcc: bccAddress,
                }),
          },
          locals: options.substitution_data,
        })
      );
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

  async getEmailTemplates(): ResultsPromise<STFCEmailTemplate[]> {
    return {
      results: [
        {
          id: 'clf-proposal-submitted-pi',
          name: 'CLF PI Co-I Submission Email',
        },
        {
          id: 'isis-proposal-submitted-pi',
          name: 'ISIS PI Co-I Submission Email',
        },
        {
          id: 'isis-rapid-proposal-submitted-pi',
          name: 'ISIS Rapid PI Co-I Submission Email',
        },
        {
          id: 'isis-rapid-proposal-submitted-uo',
          name: 'ISIS Rapid User Office Submission Email',
        },
        {
          id: 'xpress-proposal-submitted-pi',
          name: 'ISIS Xpress PI Co-I Submission Email',
        },
        {
          id: 'xpress-proposal-submitted-sc',
          name: 'ISIS Xpress Scientist Submission Email',
        },
        {
          id: 'xpress-proposal-under-review',
          name: 'ISIS Xpress PI Co-I Under Review Email',
        },
        {
          id: 'xpress-proposal-approved',
          name: 'ISIS Xpress PI Co-I Approval Email',
        },
        {
          id: 'xpress-proposal-sra',
          name: 'ISIS Xpress SRA Request Email',
        },
        {
          id: 'xpress-proposal-unsuccessful',
          name: 'ISIS Xpress PI Co-I Reject Email',
        },
        {
          id: 'xpress-proposal-finished',
          name: 'ISIS Xpress PI Co-I Finish Email',
        },
      ],
    };
  }
}
