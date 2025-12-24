import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { WorkflowDataSource } from '../datasources/WorkflowDataSource';
import { Authorized } from '../decorators';
import { MailService } from '../eventHandlers/MailService/MailService';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { WorkflowType } from '../models/Workflow';

@injectable()
export default class WorkflowQueries {
  constructor(
    @inject(Tokens.WorkflowDataSource)
    public dataSource: WorkflowDataSource,
    @inject(Tokens.MailService)
    public emailService: MailService
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getWorkflow(
    agent: UserWithRole | null,
    id: number,
    entityType: WorkflowType
  ) {
    const workflow = await this.dataSource.getWorkflow(id);

    if (workflow?.entityType !== entityType) {
      return null;
    }

    return workflow;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllWorkflows(agent: UserWithRole | null, entityType: WorkflowType) {
    const workflows = await this.dataSource.getAllWorkflows(entityType);

    return workflows;
  }

  @Authorized()
  async getConnections(agent: UserWithRole | null, workflowId: number) {
    return this.dataSource.getWorkflowConnections(workflowId);
  }

  @Authorized()
  async getStatuses(agent: UserWithRole | null, workflowId: number) {
    return this.dataSource.getWorkflowStatuses(workflowId);
  }

  @Authorized()
  async getWorkflowStatus(
    agent: UserWithRole | null,
    workflowStatusId: number
  ) {
    const status = await this.dataSource.getWorkflowStatus(workflowStatusId);

    return status;
  }

  @Authorized([Roles.USER_OFFICER])
  async getStatusChangingEventsByConnectionId(
    agent: UserWithRole | null,
    workflowConnectionId: number
  ) {
    const statusChangingEvents =
      await this.dataSource.getStatusChangingEventsByConnectionIds([
        workflowConnectionId,
      ]);

    return statusChangingEvents;
  }
}
