import { TemplateVersion } from '../../models/TemplateVersion';
import { TemplateVersionDataSource } from '../TemplateVersionDataSource';

export const dummyTemplateVersion = {
  templateVersionId: 1,
  templateId: 1,
  template:
    '{Hello, thank you for signing up for our service. We are excited to have you on board!}',
  versionNumber: 1,
  templateType: 'EMAIL',
  createdTimeStamp: '2026-07-17 08:25:12.23043+00',
};

export class TemplateVersionDataSourceMock
  implements TemplateVersionDataSource
{
  async getVersions(
    id: number,
    templateType: string
  ): Promise<{ totalCount: number; versions: TemplateVersion[] }> {
    return { totalCount: 1, versions: [dummyTemplateVersion] };
  }

  async getVersion(
    id: number,
    versionNumber: number,
    templateType: string
  ): Promise<TemplateVersion | null> {
    return dummyTemplateVersion;
  }

  async createNewVersion(
    emailTemplateId: number,
    subject?: string,
    body?: string
  ): Promise<TemplateVersion | void> {
    return dummyTemplateVersion;
  }
}
