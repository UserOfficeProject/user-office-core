import * as msal from '@azure/msal-node';
import { logger } from '@user-office-software/duo-logger';
import { NodeMailerTransportOptions } from 'email-templates';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo, Transport, TransportOptions } from 'nodemailer';
import MailMessage from 'nodemailer/lib/mailer/mail-message';

import { NodeMailerMailService } from './NodeMailerMailService';

interface MSGraphTransportOptions extends TransportOptions {
  usePool: boolean;
  maxConnections: number;
  authority: string | undefined;
  apiUrl: string | undefined;
  clientId: string | undefined;
  clientSecret: string | undefined;
  tenantId: string | undefined;
}

class MSGraphTransport implements Transport<SentMessageInfo> {
  name: string;
  version: string;

  private authToken: msal.AuthenticationResult | null = null;
  private msalClient: msal.ConfidentialClientApplication;

  constructor(private config: MSGraphTransportOptions) {
    if (
      !this.config.authority ||
      !this.config.apiUrl ||
      !this.config.clientId ||
      !this.config.clientSecret ||
      !this.config.tenantId
    ) {
      throw new Error(
        'authority, api url, client id, client secret and tenant id must be defined to be able to use the MS Graph API client'
      );
    }

    this.name = 'MSGraphTransport';
    this.version = '1.0.0';

    this.msalClient = new msal.ConfidentialClientApplication({
      auth: {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        authority: `${this.config.authority}/${this.config.tenantId}`,
      },
    });
  }

  protected isTokenExpired(): boolean {
    if (!this.authToken?.expiresOn) {
      return false;
    }

    return Date.now() >= this.authToken.expiresOn.getTime();
  }

  private async getAccessToken(): Promise<string> {
    if (this.authToken && !this.isTokenExpired()) {
      return this.authToken.accessToken;
    }

    try {
      this.authToken = await this.msalClient.acquireTokenByClientCredential({
        scopes: [`${this.config.apiUrl}/.default`],
      });

      if (!this.authToken || !this.authToken.accessToken) {
        throw new Error('Could not acquire access token');
      }
    } catch (error) {
      throw new Error('Could not retrieve an access token.');
    }

    return this.authToken.accessToken;
  }

  public async send(
    message: MailMessage<SentMessageInfo>,
    callback: (err: Error | null, info: any) => void
  ) {
    try {
      const accessToken = await this.getAccessToken();
      const {
        subject,
        from,
        to,
        text,
        html,
        attachments = [],
      } = message.data || {};

      const mail = {
        message: {
          subject,
          body: {
            contentType: html ? 'HTML' : 'TEXT',
            content: html || text || '',
          },
          toRecipients: [
            {
              emailAddress: {
                address: to,
              },
            },
          ],
          from: {
            emailAddress: {
              address: from,
            },
          },
          attachments: attachments?.map((item) => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: item.filename,
            contentType: item.contentType,
            contentBytes: item.content,
          })),
        },
        saveToSentItems: true,
      };

      const response = await fetch(
        `${this.config.apiUrl}/v1.0/users/${from}/sendMail`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mail),
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

export class MSGraphAPIMailService extends NodeMailerMailService {
  private msalClient: msal.ConfidentialClientApplication;
  private tokenInfo: msal.AuthenticationResult | null = null;

  constructor() {
    super();
  }

  protected createTransport(): NodeMailerTransportOptions {
    return nodemailer.createTransport(
      new MSGraphTransport({
        usePool: process.env.MS_GRAPH_API_USE_POOL ? true : false,
        maxConnections: parseInt(
          process.env.MS_GRAPH_API_MAX_CONNECTIONS || '5'
        ),
        authority: process.env.MS_GRAPH_API_AUTHORITY,
        apiUrl: process.env.MS_GRAPH_API_URL,
        clientId: process.env.MS_GRAPH_API_CLIENT_ID,
        clientSecret: process.env.MS_GRAPH_API_CLIENT_SECRET,
        tenantId: process.env.MS_GRAPH_API_TENANT_ID,
      })
    );
  }
}
