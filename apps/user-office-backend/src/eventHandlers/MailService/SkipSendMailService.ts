import { logger } from '@user-office-software/duo-logger';
import { ResultsPromise } from 'sparkpost';

import EmailSettings from './EmailSettings';
import { MailService, SendMailResults, SparkPostTemplate } from './MailService';

export class SkipSendMailService extends MailService {
  constructor() {
    super();
  }

  async sendMail(options: EmailSettings): ResultsPromise<SendMailResults> {
    logger.logInfo('Pretending to send an email', { ...options });

    return {
      results: {
        id: 'SkipSendMailService',
        total_accepted_recipients: options.recipients.length,
        total_rejected_recipients: 0,
      },
    };
  }

  async getEmailTemplates(
    includeDraft: boolean
  ): ResultsPromise<SparkPostTemplate[]> {
    logger.logInfo('Pretending to get email templates', { includeDraft });

    return {
      results: [
        {
          last_use: '2023-08-21T12:23:59+00:00',
          description: 'A test message from SparkPost.com',
          id: 'my-first-email',
          has_draft: false,
          published: true,
          name: 'My First Email',
          shared_with_subaccounts: false,
          has_published: true,
          last_update_time: '2022-08-14T08:42:50+00:00',
        },
        {
          last_use: '2023-08-22T12:23:59+00:00',
          description: 'A test message from SparkPost.com',
          id: 'my-second-email',
          has_draft: false,
          published: true,
          name: 'My Second Email',
          shared_with_subaccounts: false,
          has_published: true,
          last_update_time: '2023-08-14T08:42:50+00:00',
        },
      ],
    };
  }
}
