import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { EventLogFilter } from '../datasources/EventLogsDataSource';
import EventLogsDataSource from '../datasources/postgres/EventLogsDataSource';
import { Authorized } from '../decorators';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { EventLog } from '../models/EventLog';
import { Rejection, rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class EventLogMutations {
  constructor(
    @inject(Tokens.EventLogsDataSource) private dataSource: EventLogsDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async replayEventLog(
    agent: UserWithRole | null,
    id: number
  ): Promise<EventLog | Rejection> {
    const filter: EventLogFilter = {
      changedObjectId: '*',
      eventType: '*',
      id,
    };
    const eventLogs = await this.dataSource.get(filter);

    if (eventLogs.length < 1) {
      return rejection('Could not retrieve event logs', { agent, id });
    }
    const eventBus = resolveApplicationEventBus();
    eventBus.publish(JSON.parse(eventLogs[0].rowData) as ApplicationEvent);

    return eventLogs[0];
  }
}
