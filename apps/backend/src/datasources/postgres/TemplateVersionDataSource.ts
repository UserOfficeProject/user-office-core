import { injectable } from 'tsyringe';

import { TemplateVersionDataSource } from '../TemplateVersionDataSource';
import database from './database';
import { createEmailVersionsObject, TemplateVersionRecord } from './records';
import { TemplateVersion } from '../../models/TemplateVersion';

@injectable()
export default class PostgresTemplateVersionDataSource
  implements TemplateVersionDataSource
{
  async getVersions(
    id: number,
    templateType: string
  ): Promise<{ totalCount: number; versions: TemplateVersion[] }> {
    return database
      .select()
      .from('template_versions')
      .where('template_id', id)
      .andWhere('template_type', templateType)
      .then((versions: TemplateVersionRecord[]) => {
        return {
          totalCount: versions.length,
          versions: versions.map(createEmailVersionsObject),
        };
      });
  }
  async getVersion(
    id: number,
    versionNumber: number,
    templateType: string
  ): Promise<TemplateVersion | null> {
    return database
      .select()
      .from('template_versions')
      .where('template_id', id)
      .andWhere('template_type', templateType)
      .andWhere('version_number', versionNumber)
      .first()
      .then((emailVersion: TemplateVersionRecord) => {
        return emailVersion ? createEmailVersionsObject(emailVersion) : null;
      });
  }
}
