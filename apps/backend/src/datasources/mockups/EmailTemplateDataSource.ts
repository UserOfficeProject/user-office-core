import { EmailTemplateName } from '../../eventHandlers/email/emailTemplateName';
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
  createdAt: '',
};

export class EmailTemplateDataSourceMock implements EmailTemplateDataSource {
  emailTemplates: EmailTemplate[];
  constructor() {
    this.init();
  }

  public init() {
    this.emailTemplates = [
      new EmailTemplate(
        1,
        1,
        'Dummy Email Template',
        'This is a dummy email template for testing purposes.',
        'Welcome to Our Service',
        'Hello, thank you for signing up for our service. We are excited to have you on board!'
      ),
      new EmailTemplate(
        1,
        2,
        EmailTemplateName.PROPOSAL_CREATED,
        'This is a dummy email template for testing purposes.',
        'Welcome to Our Service',
        'Hello, thank you for signing up for our service. We are excited to have you on board!'
      ),
      new EmailTemplate(
        1,
        2,
        EmailTemplateName.ACCEPTED_PROPOSAL,
        'This is a dummy email template for testing purposes.',
        'Welcome to Our Service',
        'Hello, thank you for signing up for our service. We are excited to have you on board!'
      ),
      new EmailTemplate(
        1,
        2,
        EmailTemplateName.REJECTED_PROPOSAL,
        'This is a dummy email template for testing purposes.',
        'Welcome to Our Service',
        'Hello, thank you for signing up for our service. We are excited to have you on board!'
      ),
      new EmailTemplate(
        1,
        2,
        EmailTemplateName.RESERVED_PROPOSAL,
        'This is a dummy email template for testing purposes.',
        'Welcome to Our Service',
        'Hello, thank you for signing up for our service. We are excited to have you on board!'
      ),
      new EmailTemplate(
        1,
        2,
        EmailTemplateName.REVIEW_REMINDER,
        'This is a dummy email template for testing purposes.',
        'Welcome to Our Service',
        'Hello, thank you for signing up for our service. We are excited to have you on board!'
      ),
      new EmailTemplate(
        1,
        2,
        EmailTemplateName.INTERNAL_REVIEW_CREATED,
        'This is a dummy email template for testing purposes.',
        'Welcome to Our Service',
        'Hello, thank you for signing up for our service. We are excited to have you on board!'
      ),
      new EmailTemplate(
        1,
        2,
        EmailTemplateName.INTERNAL_REVIEW_DELETED,
        'This is a dummy email template for testing purposes.',
        'Welcome to Our Service',
        'Hello, thank you for signing up for our service. We are excited to have you on board!'
      ),
      new EmailTemplate(
        1,
        2,
        EmailTemplateName.INTERNAL_REVIEW_UPDATED,
        'This is a dummy email template for testing purposes.',
        'Welcome to Our Service',
        'Hello, thank you for signing up for our service. We are excited to have you on board!'
      ),
    ];
  }

  async delete(id: number): Promise<EmailTemplate> {
    return dummyEmailTemplate;
  }
  async getEmailTemplates(
    filter?: EmailTemplatesFilter
  ): Promise<{ totalCount: number; emailTemplates: EmailTemplate[] }> {
    return { totalCount: 1, emailTemplates: [dummyEmailTemplate] };
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate> {
    return this.emailTemplates.find((e) => e.id == id) || dummyEmailTemplate;
  }

  async getEmailTemplateByName(name: string): Promise<EmailTemplate> {
    return (
      this.emailTemplates.find((e) => e.name == name) || dummyEmailTemplate
    );
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
