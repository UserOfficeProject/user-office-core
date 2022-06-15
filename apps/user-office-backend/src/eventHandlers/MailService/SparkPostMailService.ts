import SparkPost from 'sparkpost';

import EmailSettings from './EmailSettings';
import { MailService, SendMailResults } from './MailService';

export class SparkPostMailService extends MailService {
  private client: SparkPost;

  constructor() {
    super();
    this.client = new SparkPost(process.env.SPARKPOST_TOKEN, {
      endpoint: 'https://api.eu.sparkpost.com:443',
    });
  }

  sendMail = (
    options: EmailSettings
  ): Promise<{
    results: SendMailResults;
  }> => {
    return this.client.transmissions.send(options);
  };
}
