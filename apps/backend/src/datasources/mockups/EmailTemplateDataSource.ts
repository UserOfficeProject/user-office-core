import { EmailTemplate } from '../../models/EmailTemplate';
import { EmailTemplatesFilter } from '../../resolvers/queries/EmailTemplatesQuery';
import { EmailTemplateDataSource } from '../EmailTemplateDataSource';

export const dummyEmailTemplate = {
  id: 1,
  createdByUserId: 1,
  name: 'Dummy Email Template',
  description: 'This is a dummy email template for testing purposes.',
  subject: 'Welcome to Our Service',
  body: 'Hello, thank you for signing up for our service. We are excited to have you on board!',
  createdAt: new Date().toISOString(),
};

export class EmailTemplateDataSourceMock implements EmailTemplateDataSource {
  async delete(id: number): Promise<EmailTemplate> {
    return dummyEmailTemplate;
  }
  async getEmailTemplates(
    filter?: EmailTemplatesFilter
  ): Promise<{ totalCount: number; emailTemplates: EmailTemplate[] }> {
    return { totalCount: 1, emailTemplates: [dummyEmailTemplate] };
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate> {
    return dummyEmailTemplate;
  }

  async create(
    createdByUserId: number,
    name: string,
    description: string,
    subject: string,
    body: string
  ): Promise<EmailTemplate> {
    return dummyEmailTemplate;
  }

  async update(
    id: number,
    name: string,
    description: string,
    subject: string,
    body: string
  ): Promise<EmailTemplate> {
    return dummyEmailTemplate;
  }
}
