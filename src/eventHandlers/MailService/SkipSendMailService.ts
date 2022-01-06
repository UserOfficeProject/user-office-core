import { logger } from '@user-office-software/duo-logger';
import EmailTemplates from 'email-templates';

import EmailSettings from './EmailSettings';
import { MailService, SendMailResults } from './MailService';

export class SkipSendMailService extends MailService {
  private _email: EmailTemplates<any>;

  constructor() {
    super();
  }

  async sendMail(options: EmailSettings): Promise<{
    results: SendMailResults;
  }> {
    logger.logInfo('Pretending to send an email', { ...options }); // TODO: fix type of the second param in the lib (don't use Record<string, unknown>)

    return {
      results: {
        id: 'SkipSendMailService',
        total_accepted_recipients: options.recipients.length,
        total_rejected_recipients: 0,
      },
    };
  }
}
