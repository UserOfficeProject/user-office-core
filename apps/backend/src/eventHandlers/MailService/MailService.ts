import { ResultsPromise } from 'sparkpost';

import EmailSettings from './EmailSettings';

export abstract class MailService {
  abstract sendMail(options: EmailSettings): ResultsPromise<SendMailResults>;
  abstract getEmailTemplates(
    includeDraft?: boolean
  ): ResultsPromise<(SparkPostTemplate | STFCEmailTemplate)[]>;
}

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

// TODO: This might need some attention from STFC and return the templates used in their email sending service.
export type STFCEmailTemplate = {
  id: string;
  name: string;
  description: string;
};

export type SendMailResults = {
  total_rejected_recipients: number;
  total_accepted_recipients: number;
  id: string;
};
