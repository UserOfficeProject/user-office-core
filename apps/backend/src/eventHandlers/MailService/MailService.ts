import EmailSettings from './EmailSettings';

export abstract class MailService {
  abstract sendMail(options: EmailSettings): Promise<{
    results: SendMailResults;
  }>;
}

export type SendMailResults = {
  total_rejected_recipients: number;
  total_accepted_recipients: number;
  id: string;
};
