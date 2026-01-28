import { EmailTemplate } from '../models/EmailTemplate';
import { EmailTemplatesFilter } from '../resolvers/queries/EmailTemplatesQuery';

export interface EmailTemplateDataSource {
  getEmailTemplate(id: number): Promise<EmailTemplate | null>;
  getEmailTemplateByName(name: string): Promise<EmailTemplate | null>;
  getEmailTemplates(
    filter?: EmailTemplatesFilter
  ): Promise<{ totalCount: number; emailTemplates: EmailTemplate[] }>;

  create(
    createdByUserId: number,
    name: string,
    description: string,
    subject: string,
    body: string
  ): Promise<EmailTemplate>;

  update(
    id: number,
    name: string,
    description: string,
    subject: string,
    body: string
  ): Promise<EmailTemplate>;

  delete(id: number): Promise<EmailTemplate>;
}
