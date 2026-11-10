import { GraphQLError } from 'graphql';
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

  async createNewVersion(
    emailTemplateId: number,
    templateType: string,
    template?: string
  ): Promise<TemplateVersion | void> {
    if (template === null) {
      return;
    }
    const templates = await this.getVersions(emailTemplateId, templateType);
    const newVersionNumber =
      templates.versions.reduce((max, t) => Math.max(max, t.versionNumber), 0) +
      1;

    return database
      .insert(
        {
          template_id: emailTemplateId,
          template: template,
          version_number: newVersionNumber,
          template_type: templateType,
        },
        ['*']
      )
      .from('template_versions')
      .then((emailTemplates: TemplateVersionRecord[]) => {
        if (emailTemplates?.length !== 1) {
          throw new GraphQLError(
            `Failed to update email version with id '${emailTemplateId}'`
          );
        }

        return createEmailVersionsObject(emailTemplates[0]);
      });
  }
}
