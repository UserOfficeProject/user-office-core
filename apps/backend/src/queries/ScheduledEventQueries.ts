import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ScheduledEventsCoreArgs } from '../resolvers/queries/ScheduledEventsCoreQuery';
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
    args: ScheduledEventsCoreArgs
  ): Promise<ScheduledEventCore[]> {
    const scheduledEvents = await this.dataSource.getScheduledEventsCore(args);

    return scheduledEvents;
  }

  @Authorized([Roles.USER])
  async getScheduledEventCore(
    user: UserWithRole | null,
    scheduledEventId: number
  ): Promise<ScheduledEventCore | null> {
    const scheduledEvent = await this.dataSource.getScheduledEventCore(
      scheduledEventId
    );

    // TODO check if user has access to this scheduled event

    return scheduledEvent;
  }
}
