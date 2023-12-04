import { logger } from '@user-office-software/duo-logger';

import { isProduction } from '../../utils/helperFunctions';
import EmailSettings from './EmailSettings';
import { MailService } from './MailService';
import { SparkPost } from './SparkPost';

export class SparkPostMailService extends MailService {
  private client: SparkPost;
  private sinkEmail: string | undefined;

  constructor() {
    super();
    const sparkPostToken = process.env.SPARKPOST_TOKEN;
    if (!sparkPostToken) {
      throw new Error(
        'Sparkpost token must be defined to be able to use the sparkpost client'
      );
    }
    this.client = new SparkPost(sparkPostToken, {
      endpoint: 'https://api.eu.sparkpost.com:443',
    });

    this.sinkEmail = process.env.SINK_EMAIL;
  }

  private getEnvOptions(options: EmailSettings) {
    return {
      ...options,
      recipients: options.recipients.map((recipient) =>
        isProduction
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

  sendMail = (options: EmailSettings) => {
    // NOTE: If it is not production and there is no sinkEmail we are not sending emails.
    if (!isProduction && !this.sinkEmail) {
      logger.logInfo('Pretending to send an email', { ...options });

      return Promise.resolve({
        results: {
          id: 'SparkPostMailService',
          total_accepted_recipients: options.recipients.length,
          total_rejected_recipients: 0,
        },
      });
    }

    const envOptions = this.getEnvOptions(options);

    return this.client.send(envOptions);
  };

  getEmailTemplates = (includeDraft = false) => {
    return this.client.getTemplates(includeDraft); // The returning type for get request is wrong because the package is not well maintained;
  };
}
