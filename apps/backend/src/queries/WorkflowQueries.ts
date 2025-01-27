import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { WorkflowDataSource } from '../datasources/WorkflowDataSource';
import { Authorized } from '../decorators';
import { MailService } from '../eventHandlers/MailService/MailService';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import {
  WorkflowConnection,
  WorkflowConnectionWithStatus,
} from '../models/WorkflowConnections';

@injectable()
export default class WorkflowQueries {
  constructor(
    @inject(Tokens.WorkflowDataSource)
    public dataSource: WorkflowDataSource,
    @inject(Tokens.MailService)
    public emailService: MailService
  ) {}

  async getWorkflow(
    agent: UserWithRole | null,
    id: number,
    entityType: 'proposal' | 'experiment' // TODO: This needs to be optimised
  ) {
    //TODO: Why is this not authenticated?
    const workflow = await this.dataSource.getWorkflow(id, entityType);

    return workflow;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllWorkflows(
    agent: UserWithRole | null,
    entityType: 'proposal' | 'experiment'
  ) {
    const workflows = await this.dataSource.getAllWorkflows(entityType);

    return workflows;
  }

  getUniqueDroppableGroupIds(list: WorkflowConnection[]) {
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

  groupWorkflowConnectionsByDroppableArea(
    workflowConnections: WorkflowConnectionWithStatus[]
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
    workflowConnectionId: number,
    entityType: 'proposal' | 'experiment'
  ) {
    const statusChangingEvents =
      await this.dataSource.getStatusChangingEventsByConnectionIds(
        [workflowConnectionId],
        entityType
      );

    return statusChangingEvents;
  }
}
