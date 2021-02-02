/* eslint-disable @typescript-eslint/camelcase */
import SparkPost from 'sparkpost';

import EmailSettings from './EmailSettings';
import { MailService, SendMailResults } from './MailService';

export class SparkPostMailService extends MailService {
  private client: SparkPost;

  constructor(options: { endpoint: string }) {
    super();
    this.client = new SparkPost(process.env.SPARKPOST_TOKEN, options);
  }

  sendMail = (
    options: EmailSettings
  ): Promise<{
    results: SendMailResults;
  }> => {
    return this.client.transmissions.send(options);
  };
}
