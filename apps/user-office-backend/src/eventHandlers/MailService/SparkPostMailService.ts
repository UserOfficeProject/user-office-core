import SparkPost, { ResultsPromise } from 'sparkpost';

import EmailSettings from './EmailSettings';
import { MailService, SendMailResults, SparkPostTemplate } from './MailService';

export class SparkPostMailService extends MailService {
  private client: SparkPost;

  constructor() {
    super();
    this.client = new SparkPost(process.env.SPARKPOST_TOKEN, {
      endpoint: 'https://api.eu.sparkpost.com:443',
    });
  }

  sendMail = (options: EmailSettings): ResultsPromise<SendMailResults> => {
    return this.client.transmissions.send(options);
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
