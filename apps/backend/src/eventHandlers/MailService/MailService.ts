export default interface SendMailOptions {
  content: {
    template: string;
  };
  recipients: {
    address: string;
    header_to?: string;
  }[];
  substitution_data?: Record<string, unknown>;
  // eslint-disable-next-line semi
}

export abstract class MailService {
  abstract sendMail(
    options: SendMailOptions
  ): Promise<{ results: SendMailResults }>;
  abstract getEmailTemplates(): Promise<{
    results: { id: string; name: string }[];
  }>;
}

export type SendMailResults = {
  total_rejected_recipients: number;
  total_accepted_recipients: number;
  id: string;
};
