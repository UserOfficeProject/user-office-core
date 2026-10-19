import { TemplateVersion } from '../models/TemplateVersion';

export interface TemplateVersionDataSource {
  getVersions(
    id: number,
    templateType: string
  ): Promise<{ totalCount: number; versions: TemplateVersion[] }>;
  getVersion(
    id: number,
    versionNumber: number,
    templateType: string
  ): Promise<TemplateVersion | null>;
}
