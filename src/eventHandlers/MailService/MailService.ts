/* eslint-disable @typescript-eslint/camelcase */

import EmailSettings from './EmailSettings';

export abstract class MailService {
  protected template_id: string;

  abstract sendMail(
    options: EmailSettings
  ): Promise<{
    results: SendMailResults;
  }>;
}

export type SendMailResults = {
  total_rejected_recipients: number;
  total_accepted_recipients: number;
  id: string;
};
