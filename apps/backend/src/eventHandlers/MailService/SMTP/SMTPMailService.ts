import { existsSync } from 'fs';
import path from 'path';

import {
  AuthenticationResult,
  ConfidentialClientApplication,
} from '@azure/msal-node';
import { logger } from '@user-office-software/duo-logger';
import EmailTemplates from 'email-templates';
import * as nodemailer from 'nodemailer';
import { createTransport } from 'nodemailer';
import { container } from 'tsyringe';

import { Tokens } from '../../../config/Tokens';
import { AdminDataSource } from '../../../datasources/AdminDataSource';
import { EmailTemplateDataSource } from '../../../datasources/EmailTemplateDataSource';
import { SettingsId } from '../../../models/Settings';
import {
  EmailTemplateSource,
  readEmailTemplateSourceFromFiles,
  renderEmailTemplate,
} from '../../../utils/emailTemplateRenderer';
import { isProduction } from '../../../utils/helperFunctions';
import SendMailOptions, { MailService, SendMailResults } from '../MailService';

export class SMTPMailService extends MailService {
  private emailTemplate: EmailTemplates<any>;
  private emailTemplateDataSource: EmailTemplateDataSource;
  private attachments: any[];
  private authToken: AuthenticationResult | null = null;
  private transport: nodemailer.Transporter | null = null;

  constructor() {
    super();

    logger.logInfo('Initializing SMTPMailService', {});

    this.emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
      Tokens.EmailTemplateDataSource
    );

    this.attachments = [];

    if (process.env.EMAIL_FOOTER_IMAGE_PATH !== undefined) {
      if (existsSync(process.env.EMAIL_FOOTER_IMAGE_PATH)) {
        this.attachments.push({
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
  }

  private async resolveEmailTemplate(identifier: string) {
    const isNumericIdentifier = /^\d+$/.test(identifier);

    if (isNumericIdentifier) {
      const byId =
        await this.emailTemplateDataSource.getEmailTemplate(+identifier);

      if (byId) {
        return byId;
      }
    }

    return this.emailTemplateDataSource.getEmailTemplateByName(identifier);
  }

  private async compileEmailTemplate(options: SendMailOptions): Promise<{
    subject: string;
    body: string;
  } | null> {
    if (process.env.NODE_ENV === 'test') {
      return { subject: '= ``', body: '' };
    }

    const emailTemplate = await this.resolveEmailTemplate(
      options.content.template
    );

    if (!emailTemplate) {
      logger.logError('Email template not found', {
        template: options.content.template,
      });

      return null;
    }

    let source: EmailTemplateSource;

    if (emailTemplate.useTemplateFile) {
      try {
        source = readEmailTemplateSourceFromFiles(emailTemplate.name);
      } catch (error) {
        logger.logError('Email template file not found', {
          error: error,
        });

        return null;
      }
    } else {
      source = {
        body: emailTemplate.body || '',
        subject: emailTemplate.subject || '',
      };
    }

    const result = renderEmailTemplate(
      source,
      (options.substitution_data as Record<string, unknown>) || {}
    );

    if ('error' in result) {
      logger.logError('Error compiling email template', {
        error: result.error,
      });

      return null;
    }

    return result;
  }

  private isTokenExpired(): boolean {
    return Date.now() >= this.authToken!.expiresOn!.getTime();
  }

  private async getAccessToken(): Promise<void> {
    if (this.authToken && !this.isTokenExpired()) {
      return;
    }

    const tokenRequest = {
      scopes: [process.env.EMAIL_SCOPE || ''],
    };

    const msalConfig = {
      auth: {
        clientId: process.env.EMAIL_CLIENT_ID || '',
        authority: `${process.env.EMAIL_AUTHORITY}/${process.env.EMAIL_TENANT_ID}`,
        clientSecret: process.env.EMAIL_CLIENT_SECRET || '',
      },
    };

    const cca = new ConfidentialClientApplication(msalConfig);
    this.authToken = await cca.acquireTokenByClientCredential(tokenRequest);

    if (!this.authToken?.expiresOn) {
      throw new Error('Invalid token: Missing expiresOn property');
    }

    if (!this.authToken || !this.authToken.accessToken) {
      throw new Error('Failed to get access token');
    }
  }

  private async createBasicAuthTransport(): Promise<void> {
    if (this.transport) {
      return;
    }

    if (process.env.EMAIL_USE_POOL && process.env.EMAIL_MAX_CONNECTIONS) {
      this.transport = nodemailer.createTransport({
        pool: true,
        maxConnections: parseInt(process.env.EMAIL_MAX_CONNECTIONS || '5'),
        host: process.env.EMAIL_AUTH_HOST,
        port: parseInt(process.env.EMAIL_AUTH_PORT || '25'),
        auth: {
          user: process.env.EMAIL_AUTH_USERNAME,
          pass: process.env.EMAIL_AUTH_PASSWORD,
        },
      });
    } else {
      this.transport = nodemailer.createTransport({
        host: process.env.EMAIL_AUTH_HOST,
        port: parseInt(process.env.EMAIL_AUTH_PORT || '25'),
        auth: {
          user: process.env.EMAIL_AUTH_USERNAME,
          pass: process.env.EMAIL_AUTH_PASSWORD,
        },
      });
    }
  }

  private async createOauth2Transport(): Promise<void> {
    if (this.transport && this.authToken && !this.isTokenExpired()) {
      return;
    }

    if (this.transport) {
      this.transport.close();
    }

    await this.getAccessToken();

    if (process.env.EMAIL_USE_POOL && process.env.EMAIL_MAX_CONNECTIONS) {
      this.transport = createTransport({
        host: process.env.EMAIL_AUTH_HOST,
        port: parseInt(process.env.EMAIL_AUTH_PORT || '587'),
        pool: true,
        maxConnections: parseInt(process.env.EMAIL_MAX_CONNECTIONS || '5'),
        secure: false,
        requireTLS: true,
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_SENDER,
          accessToken: this.authToken?.accessToken,
        },
      });
    } else {
      this.transport = createTransport({
        host: process.env.EMAIL_AUTH_HOST,
        port: parseInt(process.env.EMAIL_AUTH_PORT || '587'),
        secure: false,
        requireTLS: true,
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_SENDER,
          accessToken: this.authToken?.accessToken,
        },
      });
    }
  }

  private async createTransport(): Promise<void> {
    if (process.env.EMAIL_USE_SMTP_OAUTH_2 === 'true') {
      await this.createOauth2Transport();
    } else {
      await this.createBasicAuthTransport();
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

    if (process.env.SKIP_SMTP_EMAIL_SENDING === 'true') {
      logger.logInfo('Skipping email sending', {
        template: options.content.template,
      });

      return { results: sendMailResults };
    }

    const template = await this.compileEmailTemplate(options);

    if (!template) {
      logger.logError('Email template not found', {
        template: options.content.template,
      });

      return { results: sendMailResults };
    }

    await this.createTransport();

    if (!this.transport) {
      logger.logError('Failed to create email transport', {
        template: options.content.template,
      });

      return { results: sendMailResults };
    }

    this.emailTemplate = new EmailTemplates({
      message: {
        from: process.env.EMAIL_SENDER,
        attachments: this.attachments,
      },
      send: true,
      transport: this.transport,
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
