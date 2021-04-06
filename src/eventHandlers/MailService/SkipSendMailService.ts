import { logger } from '@esss-swap/duo-logger';
import EmailTemplates from 'email-templates';

import EmailSettings from './EmailSettings';
import { MailService, SendMailResults } from './MailService';

export class SkipSendMailService extends MailService {
  private _email: EmailTemplates<any>;

  constructor() {
    super();
  }

  async sendMail(
    options: EmailSettings
  ): Promise<{
    results: SendMailResults;
  }> {
    logger.logInfo('Pretending to send an email', options);

    return {
      results: {
        id: 'SkipSendMailService',
        total_accepted_recipients: options.recipients.length,
        total_rejected_recipients: 0,
      },
    };
  }
}
