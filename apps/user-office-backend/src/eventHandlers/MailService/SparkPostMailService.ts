import { logger } from '@user-office-software/duo-logger';
import SparkPost, { ResultsPromise } from 'sparkpost';

import { isProduction } from '../../utils/helperFunctions';
import EmailSettings from './EmailSettings';
import { MailService, SendMailResults, SparkPostTemplate } from './MailService';

export class SparkPostMailService extends MailService {
  private client: SparkPost;
  private sinkEmail: string | undefined;

  constructor() {
    super();
    this.client = new SparkPost(process.env.SPARKPOST_TOKEN, {
      endpoint: 'https://api.eu.sparkpost.com:443',
    });

    this.sinkEmail = process.env.SINK_EMAIL;
  }

  private getEnvOptions(options: EmailSettings) {
    return {
      ...options,
      recipients: options.recipients.map((recipient) =>
        isProduction()
          ? recipient
          : typeof recipient.address === 'string'
          ? {
              address: {
                email: <string>this.sinkEmail,
                header_to: recipient.address,
              },
            }
          : {
              address: {
                email: <string>this.sinkEmail,
                header_to: `${recipient.address.email}; original_header_to_${recipient.address.header_to}`,
              },
            }
      ),
    };
  }

  sendMail = (options: EmailSettings): ResultsPromise<SendMailResults> => {
    // NOTE: If it is not production and there is no sinkEmail we are not sending emails.
    if (!isProduction() && !this.sinkEmail) {
      logger.logInfo('Pretending to send an email', { ...options });

      return new Promise((resolve) => {
        resolve({
          results: {
            id: 'SparkPostMailService',
            total_accepted_recipients: options.recipients.length,
            total_rejected_recipients: 0,
          },
        });
      });
    }

    const envOptions = this.getEnvOptions(options);

    return this.client.transmissions.send(envOptions);
  };

  getEmailTemplates = (
    includeDraft = false
  ): ResultsPromise<SparkPostTemplate[]> => {
    // NOTE: Maybe it is better to use this.client.templates.list() in the future. For now it doesn't include 'draft' filter and it returns all templates. If 'sparkpost' package gets updated we can change this.
    return this.client.get({
      uri: `/api/v1/templates?draft=${includeDraft}`,
    }) as unknown as ResultsPromise<SparkPostTemplate[]>; // The returning type for get request is wrong because the package is not well maintained;
  };
}
