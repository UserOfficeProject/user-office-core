import EmailSettings from './EmailSettings';
import { ResultsPromise } from './SparkPost';

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

export type STFCEmailTemplate = {
  id: string;
  name: string;
};

export type SendMailResults = {
  total_rejected_recipients: number;
  total_accepted_recipients: number;
  id: string;
};
