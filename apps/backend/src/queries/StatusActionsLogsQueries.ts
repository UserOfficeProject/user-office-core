import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusActionsLogsDataSource } from '../datasources/StatusActionsLogsDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { StatusActionsLog } from '../models/StatusActionsLog';
import { UserWithRole } from '../models/User';
import { StatusActionsLogsFilter } from '../resolvers/queries/StatusActionsLogsQuery';

@injectable()
export default class StatusActionsLogsQueries {
  constructor(
    @inject(Tokens.StatusActionsLogsDataSource)
    public dataSource: StatusActionsLogsDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getStatusActionsLogs(
    agent: UserWithRole | null,
    filter?: StatusActionsLogsFilter
  ): Promise<StatusActionsLog[] | null> {
    return this.dataSource.getStatusActionsLogs(filter);
  }

  @Authorized([Roles.USER_OFFICER])
  async getStatusActionsLog(
    agent: UserWithRole | null,
    statusActionsLogId: number
  ): Promise<StatusActionsLog | null> {
    return this.dataSource.getStatusActionsLog(statusActionsLogId);
  }
}
