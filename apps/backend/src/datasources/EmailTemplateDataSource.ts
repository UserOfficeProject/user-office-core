import { EmailTemplate } from '../models/EmailTemplate';
import { TemplateVersion } from '../models/TemplateVersion';
import { EmailTemplatesFilter } from '../resolvers/queries/EmailTemplatesQuery';

export interface EmailTemplateDataSource {
  getEmailTemplate(id: number): Promise<EmailTemplate | null>;
  getEmailVersions(
    id: number
  ): Promise<{ totalCount: number; emailVersions: TemplateVersion[] }>;
  getEmailVersion(
    id: number,
    versionNumber: number
  ): Promise<TemplateVersion | null>;
  getEmailTemplateByName(name: string): Promise<EmailTemplate | null>;
  getEmailTemplates(
    filter?: EmailTemplatesFilter
  ): Promise<{ totalCount: number; emailTemplates: EmailTemplate[] }>;

  create(
    createdByUserId: number,
    name: string,
    description: string,
    useTemplateFile: boolean,
    subject?: string,
    body?: string
  ): Promise<EmailTemplate>;

  createNewVersion(
    emailTemplateId: number,
    subject?: string,
    body?: string
  ): Promise<TemplateVersion>;

  update(
    id: number,
    name: string,
    description: string,
    useTemplateFile: boolean,
    subject?: string,
    body?: string
  ): Promise<EmailTemplate>;

  delete(id: number): Promise<EmailTemplate>;
}
