import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusActionsDataSource } from '../datasources/StatusActionsDataSource';
import { Authorized } from '../decorators';
import { MailService } from '../eventHandlers/MailService/MailService';
import { EXCHANGE_NAME } from '../eventHandlers/messageBroker';
import { StatusAction, StatusActionType } from '../models/ProposalStatusAction';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import {
  EmailActionDefaultConfig,
  EmailStatusActionRecipients,
  EmailStatusActionRecipientsWithDescription,
  RabbitMQActionDefaultConfig,
} from '../resolvers/types/ProposalStatusActionConfig';

@injectable()
export default class StatusActionQueries {
  constructor(
    @inject(Tokens.StatusActionsDataSource)
    public dataSource: StatusActionsDataSource,
    @inject(Tokens.MailService)
    public emailService: MailService
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getStatusAction(agent: UserWithRole | null, actionId: number) {
    const statusAction = await this.dataSource.getStatusAction(actionId);

    return statusAction;
  }

  @Authorized([Roles.USER_OFFICER])
  async getStatusActions(agent: UserWithRole | null) {
    const statusActions = await this.dataSource.getStatusActions();

    return statusActions;
  }

  @Authorized([Roles.USER_OFFICER])
  async getConnectionStatusActions(
    agent: UserWithRole | null,
    { connectionId, workflowId }: { connectionId: number; workflowId: number }
  ) {
    return this.dataSource.getConnectionStatusActions(connectionId, workflowId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getStatusActionConfig(
    agent: UserWithRole | null,
    statusAction: StatusAction
  ) {
    switch (statusAction.type) {
      case StatusActionType.EMAIL:
        const allRecipientsArray = Object.values(EmailStatusActionRecipients);
        const allEmailRecipients = allRecipientsArray.map((item) => ({
          name: item,
          description: EmailStatusActionRecipientsWithDescription.get(item),
        }));

        const sparkPostEmailTemplates =
          await this.emailService.getEmailTemplates();

        const emailTemplates = sparkPostEmailTemplates.results.map((item) => ({
          id: item.id,
          name: item.name,
        }));

        return new EmailActionDefaultConfig(allEmailRecipients, emailTemplates);

      case StatusActionType.RABBITMQ:
        // NOTE: For now we return just the default exchange.
        const rabbitMQDefaultExchange = EXCHANGE_NAME;

        return new RabbitMQActionDefaultConfig([rabbitMQDefaultExchange]);

      default:
        return null;
    }
  }
}
