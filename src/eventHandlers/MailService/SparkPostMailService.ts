/* eslint-disable @typescript-eslint/camelcase */
import SparkPost from 'sparkpost';

import EmailSettings from './EmailSettings';
import { MailService, SendMailResults } from './MailService';

export class SparkPostMailService extends MailService {
  private client: SparkPost;

  constructor(options: { endpoint: string }) {
    super();
    this.client = new SparkPost(process.env.SPARKPOST_TOKEN, options);
    this.template_id = 'proposal-submitted';
  }

  sendMail = (
    options: EmailSettings
  ): Promise<{
    results: SendMailResults;
  }> => {
    options.content.template_id = this.template_id;

    return this.client.transmissions.send(options);
  };
}
