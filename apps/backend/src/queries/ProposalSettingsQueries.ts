import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { StatusActionsDataSource } from '../datasources/StatusActionsDataSource';
import { Authorized } from '../decorators';
import { MailService } from '../eventHandlers/MailService/MailService';
import { EXCHANGE_NAME } from '../eventHandlers/messageBroker';
import { Event, EventLabel } from '../events/event.enum';
import { ProposalStatusActionType } from '../models/ProposalStatusAction';
import {
  ProposalWorkflowConnection,
  WorkflowConnection,
} from '../models/ProposalWorkflowConnections';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ProposalStatusAction } from '../resolvers/types/ProposalStatusAction';
import {
  EmailActionDefaultConfig,
  EmailStatusActionRecipients,
  EmailStatusActionRecipientsWithDescription,
  RabbitMQActionDefaultConfig,
} from '../resolvers/types/ProposalStatusActionConfig';

@injectable()
export default class ProposalSettingsQueries {
  constructor(
    @inject(Tokens.ProposalSettingsDataSource)
    public dataSource: ProposalSettingsDataSource,
    @inject(Tokens.StatusActionsDataSource)
    public statusActionsDataSource: StatusActionsDataSource,
    @inject(Tokens.MailService)
    public emailService: MailService
  ) {}

  @Authorized()
  async getProposalStatus(agent: UserWithRole | null, id: number) {
    const proposalStatus = await this.dataSource.getProposalStatus(id);

    return proposalStatus;
  }

  @Authorized()
  async getAllProposalStatuses(agent: UserWithRole | null) {
    const proposalStatuses = await this.dataSource.getAllProposalStatuses();

    return proposalStatuses;
  }

  async getProposalWorkflow(agent: UserWithRole | null, id: number) {
    const proposalWorkflow = await this.dataSource.getProposalWorkflow(id);

    return proposalWorkflow;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllWorkflows(
    agent: UserWithRole | null,
    entityType: 'proposal' | 'experiment'
  ) {
    const workflows = await this.dataSource.getAllWorkflows(entityType);

    return workflows;
  }

  getUniqueDroppableGroupIds(list: ProposalWorkflowConnection[]) {
    const flags = new Set();

    return (
      list
        .map((item) => ({
          droppableGroupId: item.droppableGroupId,
          prevStatusId: item.prevStatusId,
        }))
        // remove duplicates
        .filter((item) => {
          if (flags.has(item.droppableGroupId)) {
            return false;
          }
          flags.add(item.droppableGroupId);

          return true;
        })
    );
  }

  groupProposalWorkflowConnectionsByDroppableArea(
    proposalWorkflowConnections: ProposalWorkflowConnection[]
  ) {
    const groupedProposalWorkflowConnections = this.getUniqueDroppableGroupIds(
      proposalWorkflowConnections
    ).map((item) => ({
      groupId: item.droppableGroupId,
      parentGroupId:
        proposalWorkflowConnections.find(
          (element) => element.proposalStatusId === item.prevStatusId
        )?.droppableGroupId || null,
      connections: proposalWorkflowConnections.filter(
        (proposalWorkflowConnection) =>
          proposalWorkflowConnection.droppableGroupId === item.droppableGroupId
      ),
    }));

    return groupedProposalWorkflowConnections;
  }

  groupWorkflowConnectionsByDroppableArea(
    workflowConnections: WorkflowConnection[]
  ) {
    const groupedWorkflowConnections = this.getUniqueDroppableGroupIds(
      workflowConnections
    ).map((item) => ({
      groupId: item.droppableGroupId,
      parentGroupId:
        workflowConnections.find(
          (element) => element.statusId === item.prevStatusId
        )?.droppableGroupId || null,
      connections: workflowConnections.filter(
        (workflowConnection) =>
          workflowConnection.droppableGroupId === item.droppableGroupId
      ),
    }));

    return groupedWorkflowConnections;
  }

  @Authorized()
  async workflowConnectionGroups(
    agent: UserWithRole | null,
    workflowId: number,
    entityType: 'proposal' | 'experiment'
  ) {
    const workflowConnections = await this.dataSource.getWorkflowConnections(
      workflowId,
      entityType
    );
    const groupedWorkflowConnections =
      this.groupWorkflowConnectionsByDroppableArea(workflowConnections);

    return groupedWorkflowConnections;
  }

  @Authorized([Roles.USER_OFFICER])
  async getStatusChangingEventsByConnectionId(
    agent: UserWithRole | null,
    proposalWorkflowConnectionId: number
  ) {
    const statusChangingEvents =
      await this.dataSource.getStatusChangingEventsByConnectionIds([
        proposalWorkflowConnectionId,
      ]);

    return statusChangingEvents;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllProposalEvents(agent: UserWithRole | null) {
    const allEventsArray = Object.values(Event);
    const allProposalEvents = allEventsArray
      .filter(
        (eventItem) =>
          eventItem.startsWith('PROPOSAL_') || eventItem.startsWith('CALL_')
      )
      .map((eventItem) => ({
        name: eventItem,
        description: EventLabel.get(eventItem),
      }));

    return allProposalEvents;
  }

  @Authorized([Roles.USER_OFFICER])
  async getStatusAction(agent: UserWithRole | null, actionId: number) {
    const statusAction =
      await this.statusActionsDataSource.getStatusAction(actionId);

    return statusAction;
  }

  @Authorized([Roles.USER_OFFICER])
  async getStatusActions(agent: UserWithRole | null) {
    const statusActions = await this.statusActionsDataSource.getStatusActions();

    return statusActions;
  }

  @Authorized([Roles.USER_OFFICER])
  async getConnectionStatusActions(
    agent: UserWithRole | null,
    { connectionId, workflowId }: { connectionId: number; workflowId: number }
  ) {
    return this.statusActionsDataSource.getConnectionStatusActions(
      connectionId,
      workflowId
    );
  }

  @Authorized([Roles.USER_OFFICER])
  async getStatusActionConfig(
    agent: UserWithRole | null,
    statusAction: ProposalStatusAction
  ) {
    switch (statusAction.type) {
      case ProposalStatusActionType.EMAIL:
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

      case ProposalStatusActionType.RABBITMQ:
        // NOTE: For now we return just the default exchange.
        const rabbitMQDefaultExchange = EXCHANGE_NAME;

        return new RabbitMQActionDefaultConfig([rabbitMQDefaultExchange]);

      default:
        return null;
    }
  }
}
