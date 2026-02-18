import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { EmailTemplateDataSource } from '../datasources/EmailTemplateDataSource';
import StatusActionsDataSource from '../datasources/postgres/StatusActionsDataSource';
import { Authorized, EventBus } from '../decorators';
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
    if (!agent) {
      return rejection('Unauthorized', { args });
    }

    try {
      const createdEmailTemplate = await this.dataSource.create(
        agent.id,
        args.name,
        args.description,
        args.useTemplateFile,
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
  @EventBus(Event.EMAIL_TEMPLATE_UPDATED)
  async update(
    agent: UserWithRole | null,
    args: UpdateEmailTemplateInput
  ): Promise<EmailTemplate | Rejection> {
    try {
      const updatedEmailTemplate = await this.dataSource.update(
        args.id,
        args.name,
        args.description,
        args.useTemplateFile,
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
  @EventBus(Event.EMAIL_TEMPLATE_DELETED)
  async delete(
    agent: UserWithRole | null,
    { emailTemplateId }: { emailTemplateId: number }
  ): Promise<EmailTemplate | Rejection> {
    const emailTemplate =
      await this.dataSource.getEmailTemplate(emailTemplateId);

    if (!emailTemplate) {
      return rejection('Email template not found', { emailTemplateId });
    }

    const has =
      await this.statusActionsDataSource.hasEmailTemplateIdConnectionStatusAction(
        emailTemplate.id
      );

    if (has) {
      return rejection(
        'Could not delete email template (used in status actions)',
        { emailTemplateId }
      );
    }

    try {
      const result = await this.dataSource.delete(emailTemplateId);

      return result;
    } catch (error) {
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
