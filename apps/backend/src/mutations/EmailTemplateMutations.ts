import { inject, injectable } from 'tsyringe';
import { Authorized } from 'type-graphql';

import { Tokens } from '../config/Tokens';
import { EmailTemplateDataSource } from '../datasources/EmailTemplateDataSource';
import StatusActionsDataSource from '../datasources/postgres/StatusActionsDataSource';
import { EventBus } from '../decorators';
import { Event } from '../events/event.enum';
import { EmailTemplate } from '../models/EmailTemplate';
import { Rejection, rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CreateEmailTemplateInput } from '../resolvers/mutations/CreateEmailTemplateMutation';
import { UpdateEmailTemplateInput } from '../resolvers/mutations/UpdateEmailTemplateMutation';

@injectable()
export default class EmailTemplateMutations {
  constructor(
    @inject(Tokens.EmailTemplateDataSource)
    private dataSource: EmailTemplateDataSource,
    @inject(Tokens.StatusActionsDataSource)
    private statusActionsDataSource: StatusActionsDataSource
  ) {}

  @EventBus(Event.EMAIL_TEMPLATE_CREATED)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    args: CreateEmailTemplateInput
  ): Promise<EmailTemplate | Rejection> {
    try {
      const createdEmailTemplate = await this.dataSource.create(
        args.createdByUserId,
        args.name,
        args.description,
        args.subject,
        args.body
      );

      return createdEmailTemplate;
    } catch (error) {
      return rejection('Could not create email template', {
        agent,
        name: args.name,
      });
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    args: UpdateEmailTemplateInput
  ): Promise<EmailTemplate | Rejection> {
    try {
      const updatedEmailTemplate = await this.dataSource.update(
        args.id,
        args.name,
        args.description,
        args.subject,
        args.body
      );

      return updatedEmailTemplate;
    } catch (error) {
      return rejection('Could not update email template', {
        agent,
        name: args.name,
      });
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    { emailTemplateId }: { emailTemplateId: number }
  ): Promise<EmailTemplate | Rejection> {
    const has =
      await this.statusActionsDataSource.hasEmailTemplateIdConnectionStatusAction(
        emailTemplateId
      );

    if (has) {
      return rejection(
        'Could not delete email template (used in status actions)',
        { emailTemplateId }
      );
    }

    const emailTemplate =
      await this.dataSource.getEmailTemplate(emailTemplateId);

    if (!emailTemplate) {
      return rejection('Email template not found', { emailTemplateId });
    }

    try {
      const result = await this.dataSource.delete(emailTemplateId);

      return result;
    } catch (error) {
      // NOTE: We are explicitly casting error to { code: string } type because it is the easiest solution for now and because it's type is a bit difficult to determine because of knexjs not returning typed error message.
      if ((error as { code: string }).code === '23503') {
        return rejection(
          'Failed to delete call, it has dependencies which need to be deleted first',
          { emailTemplateId },
          error
        );
      }

      return rejection(
        'Failed to delete email template',
        {
          agent,
          emailTemplateId,
        },
        error
      );
    }
  }
}
