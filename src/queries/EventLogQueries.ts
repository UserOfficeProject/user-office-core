import {
  EventLogsDataSource,
  EventLogFilter,
} from '../datasources/EventLogsDataSource';
import { User } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class EventLogQueries {
  constructor(
    private dataSource: EventLogsDataSource,
    private userAuth: UserAuthorization
  ) {}

  // NOTE: * is used when we want to get all event logs without applying any filter
  async getAll(
    agent: User | null,
    filter: EventLogFilter = { changedObjectId: '*', eventType: '*' }
  ) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return await this.dataSource.get(filter);
    } else {
      return null;
    }
  }
}
