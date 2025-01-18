import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusDataSource } from '../datasources/StatusDataSource';
import { Authorized } from '../decorators';
import { MailService } from '../eventHandlers/MailService/MailService';
import { UserWithRole } from '../models/User';

@injectable()
export default class StatusQueries {
  constructor(
    @inject(Tokens.StatusDataSource)
    public dataSource: StatusDataSource,
    @inject(Tokens.MailService)
    public emailService: MailService
  ) {}

  @Authorized()
  async getStatus(
    agent: UserWithRole | null,
    id: number,
    entityType: 'proposal' | 'experiment' // TODO: This needs to be optimised
  ) {
    const proposalStatus = await this.dataSource.getStatus(id, entityType);

    return proposalStatus;
  }

  @Authorized()
  async getAllStatuses(
    agent: UserWithRole | null,
    entityType: 'proposal' | 'experiment' // TODO: This needs to be optimised
  ) {
    const proposalStatuses = await this.dataSource.getAllStatuses(entityType);

    return proposalStatuses;
  }
}
