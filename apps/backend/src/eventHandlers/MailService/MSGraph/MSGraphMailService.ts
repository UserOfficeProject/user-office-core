import { existsSync, readFileSync } from 'node:fs';

import * as msal from '@azure/msal-node';
import { logger } from '@user-office-software/duo-logger';
import { NodeMailerTransportOptions } from 'email-templates';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo, Transport } from 'nodemailer';
import MailMessage from 'nodemailer/lib/mailer/mail-message';

import { TemplateMailService } from '../TemplateMailService';

class MSGraphTransport implements Transport<SentMessageInfo> {
  name: string;
  version: string;

  private apiUrl: string;
  private authToken: msal.AuthenticationResult | null = null;
  private msalClient: msal.ConfidentialClientApplication;
  private tokenPromise: Promise<any> | null = null;

  constructor() {
    this.name = 'MSGraphTransport';
    this.version = '1.0.0';
    this.apiUrl = process.env.MS_GRAPH_API_URL || '';

    this.msalClient = new msal.ConfidentialClientApplication({
      auth: {
        clientId: process.env.MS_GRAPH_API_CLIENT_ID!,
        clientSecret: process.env.MS_GRAPH_API_CLIENT_SECRET!,
        authority: `${process.env.MS_GRAPH_API_AUTHORITY}/${process.env.MS_GRAPH_API_TENANT_ID}`,
      },
    });
  }

  protected isTokenExpired(): boolean {
    if (!this.authToken?.expiresOn) {
      throw new Error('Invalid token: Missing expiresOn property');
    }

    return Date.now() >= this.authToken.expiresOn.getTime();
  }

  private async getAuthToken(): Promise<msal.AuthenticationResult> {
    // if we already have a valid token, return it
    if (this.authToken && !this.isTokenExpired()) {
      return this.authToken;
    }

    // cache the promise to prevent multiple simultaneous token requests
    if (!this.tokenPromise) {
      this.tokenPromise = (async () => {
        try {
          this.authToken = await this.msalClient.acquireTokenByClientCredential(
            {
              scopes: [`${this.apiUrl}/.default`],
            }
          );

          logger.logInfo('Acquired new access token for Microsoft Graph API', {
            expiresOn: this.authToken?.expiresOn,
          });
        } finally {
          this.tokenPromise = null;
        }
      })();
    }

    return this.tokenPromise;
  }

  public async send(
    message: MailMessage<SentMessageInfo>,
    callback: (err: Error | null, info: unknown) => void
  ) {
    try {
      const token = await this.getAuthToken();

      if (!token?.accessToken) {
        throw new Error(
          'Failed to acquire access token for Microsoft Graph API'
        );
      }

      const {
        subject,
        to,
        from,
        html,
        bcc,
        attachments = [],
      } = message.data || {};

      const payload = {
        message: {
          subject: subject || '',
          body: {
            contentType: 'HTML',
            content: html || '',
          },
          toRecipients: [
            {
              emailAddress: {
                address: to,
              },
            },
          ],
          bccRecipients: bcc
            ? [
                {
                  emailAddress: {
                    address: bcc,
                  },
                },
              ]
            : undefined,
          attachments: attachments,
        },
        saveToSentItems: true,
      };

      const response = await fetch(
        `${this.apiUrl}/v1.0/users/${from}/sendMail`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        logger.logError('Unable to send email to user', {
          error: response.statusText + ' : ' + response.status,
        });

        throw new Error(
          `Failed to send email. Status: ${response.status} - ${response.statusText}`
        );
      }

      const responseData = await response.text();
      callback(null, {
        envelope: {
          from: from,
          to: [to],
        },
        messageId: '',
        accepted: [],
        rejected: [],
        pending: [],
        response: responseData,
      });
    } catch (error: any) {
      logger.logError('Unable to send email to user', {
        error: error,
      });

      callback(error, null);
    }
  }
}

export class MSGraphMailService extends TemplateMailService {
  constructor() {
    super();
  }

  protected createTransport(): NodeMailerTransportOptions {
    return nodemailer.createTransport(new MSGraphTransport());
  }

  protected createAttachments() {
    const attachments = [];

    if (process.env.EMAIL_FOOTER_IMAGE_PATH !== undefined) {
      if (existsSync(process.env.EMAIL_FOOTER_IMAGE_PATH)) {
        attachments.push({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: 'logo.png',
          contentType: 'image/png',
          contentBytes: readFileSync(
            process.env.EMAIL_FOOTER_IMAGE_PATH
          ).toString('base64'),
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
