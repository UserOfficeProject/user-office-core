import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ScheduledEventsCoreFilter } from '../resolvers/queries/ScheduledEventsCoreQuery';
import { ScheduledEventCore } from './../resolvers/types/ScheduledEvent';

@injectable()
export default class ScheduledEventQueries {
  constructor(
    @inject(Tokens.ScheduledEventDataSource)
    public dataSource: ScheduledEventDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getScheduledEventsCore(
    user: UserWithRole | null,
    filter: ScheduledEventsCoreFilter
  ): Promise<ScheduledEventCore[]> {
    const scheduledEvents = await this.dataSource.getScheduledEventsCore(
      filter
    );

    return scheduledEvents;
  }
}
