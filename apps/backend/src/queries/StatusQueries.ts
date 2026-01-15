import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusDataSource } from '../datasources/StatusDataSource';
import { Authorized } from '../decorators';
import { MailService } from '../eventHandlers/MailService/MailService';
import { UserWithRole } from '../models/User';
import { WorkflowType } from '../models/Workflow';

@injectable()
export default class StatusQueries {
  constructor(
    @inject(Tokens.StatusDataSource)
    public dataSource: StatusDataSource,
    @inject(Tokens.MailService)
    public emailService: MailService
  ) {}

  @Authorized()
  async getStatus(agent: UserWithRole | null, id: string) {
    const status = await this.dataSource.getStatus(id);

    return status;
  }

  @Authorized()
  async getAllStatuses(agent: UserWithRole | null, entityType: WorkflowType) {
    const statuses = await this.dataSource.getAllStatuses(entityType);

    return statuses;
  }

  @Authorized()
  async getWorkflowStatus(agent: UserWithRole | null, id: number) {
    const status = await this.dataSource.getWorkflowStatus(id);

    return status;
  }

  @Authorized()
  async getAllWorkflowStatuses(agent: UserWithRole | null, workflowId: number) {
    const statuses = await this.dataSource.getAllWorkflowStatuses(workflowId);

    return statuses;
  }
}
