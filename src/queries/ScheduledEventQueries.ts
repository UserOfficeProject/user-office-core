import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ScheduledEventsFilter } from './../resolvers/queries/ScheduledEventsQuery';
import { ScheduledEventCore } from './../resolvers/types/ScheduledEvent';

@injectable()
export default class ScheduledEventQueries {
  constructor(
    @inject(Tokens.ScheduledEventDataSource)
    public dataSource: ScheduledEventDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async getScheduledEvents(
    user: UserWithRole | null,
    filter: ScheduledEventsFilter
  ): Promise<ScheduledEventCore[]> {
    const scheduledEvents = await this.dataSource.getScheduledEvents(filter);

    return scheduledEvents;
  }
}
