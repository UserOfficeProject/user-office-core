import path from 'path';

import { logger } from '@user-office-software/duo-logger';
import EmailTemplates from 'email-templates';
import * as nodemailer from 'nodemailer';
import { ResultsPromise } from 'sparkpost';

import { isProduction } from '../../utils/helperFunctions';
import EmailSettings from './EmailSettings';
import { MailService, STFCEmailTemplate, SendMailResults } from './MailService';

export class SMTPMailService extends MailService {
  private _email: EmailTemplates<any>;

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

    this._email = new EmailTemplates({
      message: {
        from: process.env.EMAIL_SENDER,
        attachments,
      },
      send: true,
      transport: nodemailer.createTransport({
        host: process.env.EMAIL_AUTH_HOST,
        port: parseInt(process.env.EMAIL_AUTH_PORT || '25'),
        ...(process.env.EMAIL_AUTH_USERNAME && process.env.EMAIL_AUTH_PASSWORD
          ? {
              auth: {
                user: process.env.EMAIL_AUTH_USERNAME,
                pass: process.env.EMAIL_AUTH_PASSWORD,
              },
            }
          : {}),
      }),
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

  async sendMail(options: EmailSettings): ResultsPromise<SendMailResults> {
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
      !(await (this._email as any).templateExists(template)) &&
      process.env.NODE_ENV !== 'test'
    ) {
      logger.logError('Template does not exist', {
        templateId: template,
      });

      return { results: sendMailResults };
    }

    options.recipients.forEach((participant) => {
      emailPromises.push(
        this._email.send({
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
                }
              : {
                  to: isProduction
                    ? participant.address
                    : <string>process.env.SINK_EMAIL,
                }),
          },
          locals: options.substitution_data,
        })
      );
    });

    return Promise.allSettled(emailPromises).then((results) => {
      results.forEach((result) => {
        if (result.status === 'rejected') {
          logger.logWarn('Unable to send email to user', {
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

  // TODO: This might need some attention from STFC and return the templates used in their email sending service.
  async getEmailTemplates(
    includeDraft = false
  ): ResultsPromise<STFCEmailTemplate[]> {
    return {
      results: [
        {
          id: 'my-first-email',
          name: 'My First Email',
          description: 'A test message from STFC',
        },
        {
          id: 'my-second-email',
          name: 'My Second Email',
          description: 'A test message from STFC',
        },
      ],
    };
  }
}
