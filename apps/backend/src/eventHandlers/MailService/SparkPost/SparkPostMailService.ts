import { logger } from '@user-office-software/duo-logger';

import { isProduction, isStaging } from '../../../utils/helperFunctions';
import SendMailOptions, { MailService } from '../MailService';
import { SparkPost } from './SparkPost';

export type SparkPostTemplate = {
  last_use: string;
  description: string;
  id: string;
  has_draft: boolean;
  published: boolean;
  name: string;
  shared_with_subaccounts: boolean;
  has_published: boolean;
  last_update_time: string;
};

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

  private getEnvOptions(options: SendMailOptions) {
    return {
      content: {
        template_id: options.content.template,
      },
      recipients: options.recipients.map((recipient) =>
        isProduction || isStaging
          ? {
              address: {
                email: recipient.address,
                header_to: recipient.header_to,
              },
            }
          : {
              address: {
                email: <string>this.sinkEmail,
                header_to: `${recipient.address}${recipient.header_to ? `; original_header_to_${recipient.header_to}` : ''}`,
              },
            }
      ),
      substitution_data: options.substitution_data,
    };
  }

  sendMail = (options: SendMailOptions) => {
    // NOTE: If it is not production and there is no sinkEmail we are not sending emails.
    if (!isProduction && !isStaging && !this.sinkEmail) {
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

  getEmailTemplates = () => {
    return this.client.getTemplates(false);
  };
}
