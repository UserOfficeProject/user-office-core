import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  EventLogsDataSource,
  EventLogFilter,
} from '../datasources/EventLogsDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class EventLogQueries {
  constructor(
    @inject(Tokens.EventLogsDataSource) private dataSource: EventLogsDataSource
  ) {}

  // NOTE: * is used when we want to get all event logs without applying any filter
  @Authorized([Roles.USER_OFFICER])
  async getAll(
    agent: UserWithRole | null,
    filter: EventLogFilter = { changedObjectId: '*', eventType: '*' }
  ) {
    return await this.dataSource.get(filter);
  }
}
