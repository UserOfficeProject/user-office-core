import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { EmailTemplate } from '../../models/EmailTemplate';
import { EmailTemplatesFilter } from '../../resolvers/queries/EmailTemplatesQuery';
import { EmailTemplateDataSource } from '../EmailTemplateDataSource';
import database from './database';
import { createEmailTemplateObject, EmailTemplateRecord } from './records';

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
    subject: string,
    body: string
  ): Promise<EmailTemplate> {
    return database
      .insert(
        {
          created_by: createdByUserId,
          name: name,
          description: description,
          subject: subject,
          body: body,
        },
        ['*']
      )
      .from('email_templates')
      .then((emailTemplates: EmailTemplateRecord[]) => {
        if (emailTemplates?.length === 0) {
          throw new GraphQLError(`Failed to create email template '${name}'`);
        }

        return createEmailTemplateObject(emailTemplates[0]);
      });
  }

  async update(
    emailTemplateId: number,
    name: string,
    description: string,
    subject: string,
    body: string
  ): Promise<EmailTemplate> {
    return database
      .update(
        {
          name: name,
          description: description,
          subject: subject,
          body: body,
        },
        ['*']
      )
      .from('email_templates')
      .where('email_templates.email_template_id', emailTemplateId)
      .then((emailTemplates: EmailTemplateRecord[]) => {
        if (emailTemplates === undefined || emailTemplates.length !== 1) {
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
        if (emailTemplates === undefined || emailTemplates.length !== 1) {
          throw new GraphQLError(
            `Could not delete emailTemplate with id:${id}`
          );
        }

        return createEmailTemplateObject(emailTemplates[0]);
      });
  }
}
