import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { EmailTemplate } from '../../models/EmailTemplate';
import { EmailTemplatesFilter } from '../../resolvers/queries/EmailTemplatesQuery';
import { EmailTemplateDataSource } from '../EmailTemplateDataSource';
import database from './database';
import {
  createEmailTemplateObject,
  createEmailVersionsObject,
  EmailTemplateRecord,
  TemplateVersionRecord,
} from './records';
import { TemplateVersion } from '../../models/TemplateVersion';

@injectable()
export default class PostgresEmailTemplateDataSource
  implements EmailTemplateDataSource
{
  async getEmailTemplate(id: number): Promise<EmailTemplate | null> {
    return database
      .select()
      .from('email_templates')
      .where('email_template_id', id)
      .first()
      .then((emailTemplate: EmailTemplateRecord) => {
        return emailTemplate ? createEmailTemplateObject(emailTemplate) : null;
      });
  }

  async getEmailVersions(
    id: number
  ): Promise<{ totalCount: number; emailVersions: TemplateVersion[] }> {
    return database
      .select()
      .from('template_versions')
      .where('template_id', id)
      .andWhere('template_type', 'EMAIL')
      .then((emailVersions: TemplateVersionRecord[]) => {
        return {
          totalCount: emailVersions.length,
          emailVersions: emailVersions.map(createEmailVersionsObject),
        };
      });
  }
  async getEmailVersion(
    id: number,
    versionNumber: number
  ): Promise<TemplateVersion | null> {
    return database
      .select()
      .from('template_versions')
      .where('template_id', id)
      .andWhere('template_type', 'EMAIL')
      .andWhere('version_number', versionNumber)
      .first()
      .then((emailVersion: TemplateVersionRecord) => {
        return emailVersion ? createEmailVersionsObject(emailVersion) : null;
      });
  }

  async getEmailTemplateByName(name: string): Promise<EmailTemplate | null> {
    return database
      .select()
      .from('email_templates')
      .where('name', name)
      .first()
      .then((emailTemplate: EmailTemplateRecord) => {
        return emailTemplate ? createEmailTemplateObject(emailTemplate) : null;
      });
  }

  async getEmailTemplates(
    filter?: EmailTemplatesFilter
  ): Promise<{ totalCount: number; emailTemplates: EmailTemplate[] }> {
    const query = database('email_templates').select(['*']);

    if (filter?.filter) {
      query.whereILikeEscaped('name', '%?%', filter.filter);
    }

    if (filter?.emailTemplateIds) {
      query.whereIn('email_template_id', filter.emailTemplateIds);
    }

    if (filter?.first) {
      query.limit(filter?.first);
    }

    if (filter?.offset) {
      query.offset(filter?.offset);
    }

    return database
      .select()
      .from('email_templates')
      .then((emailTemplates: EmailTemplateRecord[]) => {
        return {
          totalCount: emailTemplates.length,
          emailTemplates: emailTemplates.map(createEmailTemplateObject),
        };
      });
  }

  async create(
    createdByUserId: number,
    name: string,
    description: string,
    useTemplateFile: boolean,
    subject?: string,
    body?: string
  ): Promise<EmailTemplate> {
    return database
      .insert(
        {
          created_by: createdByUserId,
          name: name,
          description: description,
          subject: subject,
          body: body,
          use_template_file: useTemplateFile,
        },
        ['*']
      )
      .from('email_templates')
      .then((emailTemplates: EmailTemplateRecord[]) => {
        if (emailTemplates?.length !== 1) {
          throw new GraphQLError(`Failed to create email template '${name}'`);
        }

        return createEmailTemplateObject(emailTemplates[0]);
      });
  }

  async createNewVersion(
    emailTemplateId: number,
    subject?: string,
    body?: string
  ): Promise<TemplateVersion> {
    const template = {
      body: body,
      subject: subject,
    };
    const templates = this.getEmailVersions(emailTemplateId);
    const versionNumbers: number[] = [];
    (await templates).emailVersions.map((t) =>
      versionNumbers.push(t.versionNumber)
    );
    const sortVersionNumbers = versionNumbers.sort((n1, n2) => n2 - n1);
    let newVersionNumber = sortVersionNumbers[0] + 1;
    if (isNaN(newVersionNumber)) {
      newVersionNumber = 1;
    }

    return database
      .insert(
        {
          template_id: emailTemplateId,
          template: template,
          version_number: newVersionNumber,
          template_type: 'EMAIL',
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

  async update(
    emailTemplateId: number,
    name: string,
    description: string,
    useTemplateFile: boolean,
    subject?: string,
    body?: string
  ): Promise<EmailTemplate> {
    await this.createNewVersion(emailTemplateId, subject, body);

    return database
      .update(
        {
          name: name,
          description: description,
          subject: subject,
          body: body,
          use_template_file: useTemplateFile,
        },
        ['*']
      )
      .from('email_templates')
      .where('email_templates.email_template_id', emailTemplateId)
      .then((emailTemplates: EmailTemplateRecord[]) => {
        if (emailTemplates?.length !== 1) {
          throw new GraphQLError(
            `Failed to update email template with id '${emailTemplateId}'`
          );
        }

        return createEmailTemplateObject(emailTemplates[0]);
      });
  }

  async delete(id: number): Promise<EmailTemplate> {
    return database
      .where('email_templates.email_template_id', id)
      .del()
      .from('email_templates')
      .returning('*')
      .then((emailTemplates: EmailTemplateRecord[]) => {
        if (emailTemplates?.length !== 1) {
          throw new GraphQLError(
            `Could not delete emailTemplate with id:${id}`
          );
        }

        return createEmailTemplateObject(emailTemplates[0]);
      });
  }
}
