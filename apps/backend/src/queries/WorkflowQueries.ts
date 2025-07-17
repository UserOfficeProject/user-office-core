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
  async getWorkflow(agent: UserWithRole | null, id: number) {
    const workflow = await this.dataSource.getWorkflow(id);

    return workflow;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllWorkflows(agent: UserWithRole | null, entityType: WorkflowType) {
    const workflows = await this.dataSource.getAllWorkflows(entityType);

    return workflows;
  }

  @Authorized()
  async getWorkflowConnections(agent: UserWithRole | null, workflowId: number) {
    return this.dataSource.getWorkflowConnections(workflowId);
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
