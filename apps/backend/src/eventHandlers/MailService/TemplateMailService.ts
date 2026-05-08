import { existsSync, readFileSync } from 'node:fs';
import path from 'path';

import { logger } from '@user-office-software/duo-logger';
import EmailTemplates, { NodeMailerTransportOptions } from 'email-templates';
import pug from 'pug';
import { container } from 'tsyringe';

import SendMailOptions, { MailService, SendMailResults } from './MailService';
import { Tokens } from '../../config/Tokens';
import { AdminDataSource } from '../../datasources/AdminDataSource';
import { EmailTemplateDataSource } from '../../datasources/EmailTemplateDataSource';
import { SettingsId } from '../../models/Settings';
import { isProduction } from '../../utils/helperFunctions';

export abstract class TemplateMailService extends MailService {
  protected emailTemplate: EmailTemplates<any>;
  protected emailTemplateDataSource: EmailTemplateDataSource;

  constructor() {
    super();

    logger.logInfo('Initializing TemplateMailService', {});

    this.emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
      Tokens.EmailTemplateDataSource
    );
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

  protected createTransport(): NodeMailerTransportOptions | undefined {
    return undefined;
  }

  protected createEmailTemplate() {
    if (this.emailTemplate) {
      return;
    }

    this.emailTemplate = new EmailTemplates({
      message: {
        from: process.env.EMAIL_SENDER,
        attachments: this.createAttachments(),
      },
      send: true,
      transport: this.createTransport(),
      juice: true,
      juiceResources: {
        webResources: {
          relativeTo: path.resolve(process.env.EMAIL_TEMPLATE_PATH || ''),
        },
      },
      render: (view: string) => {
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

  protected getEmailTemplatePath(type: string, template: string): string {
    return path.join(
      process.env.EMAIL_TEMPLATE_PATH || '',
      `${template}.${type}`
    );
  }

  protected async compileEmailTemplate(options: SendMailOptions): Promise<{
    subject: string;
    body: string;
  } | null> {
    if (process.env.NODE_ENV === 'test') {
      return { subject: '= ``', body: '' };
    }

    const emailTemplate = await this.emailTemplateDataSource.getEmailTemplate(
      +options.content.template
    );

    if (!emailTemplate) {
      logger.logError('Email template not found', {
        template: options.content.template,
      });

      return null;
    }

    let templateBody = '';
    let templateSubject = '';

    if (emailTemplate.useTemplateFile) {
      const templateBodyPath =
        this.getEmailTemplatePath('html', emailTemplate.name) + '.pug';
      const templateSubjectPath =
        this.getEmailTemplatePath('subject', emailTemplate.name) + '.pug';

      try {
        templateBody = readFileSync(templateBodyPath, 'utf-8');
        templateSubject = readFileSync(templateSubjectPath, 'utf-8');
      } catch (error) {
        logger.logError('Email template file not found', {
          error: error,
        });

        return null;
      }
    } else {
      templateBody = emailTemplate.body || '';
      templateSubject = emailTemplate.subject || '';
    }

    try {
      let compiledSubject = '';
      let compiledBody = '';
      compiledSubject = pug.render(
        templateSubject,
        options.substitution_data || {}
      );
      compiledBody = pug.render(templateBody, options.substitution_data || {});

      return {
        subject: compiledSubject,
        body: compiledBody,
      };
    } catch (error) {
      logger.logError('Error compiling email template', {
        error: error,
      });

      return null;
    }
  }

  async sendMail(options: SendMailOptions) {
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

    this.createEmailTemplate();

    const template = await this.compileEmailTemplate(options);

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
      emailPromises.push(
        this.emailTemplate.send({
          message: {
            ...(participant.header_to
              ? {
                  to: {
                    address: isProduction
                      ? participant.address
                      : <string>process.env.SINK_EMAIL,
                    name: participant.header_to,
                  },
                  bcc: bccAddress,
                  subject: template.subject,
                  html: template.body,
                }
              : {
                  to: isProduction
                    ? participant.address
                    : <string>process.env.SINK_EMAIL,
                  bcc: bccAddress,
                  subject: template.subject,
                  html: template.body,
                }),
          },
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

  async getEmailTemplates() {
    const emailTemplates =
      await this.emailTemplateDataSource.getEmailTemplates();

    return {
      results: emailTemplates.emailTemplates.map((template) => ({
        id: template.id.toString(),
        name: template.name || '',
      })),
    };
  }
}
