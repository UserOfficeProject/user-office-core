import { EventLogsDataSource } from '../datasources/EventLogsDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import createEmailHandler from './email';
import createLoggingHandler from './logging';
// import createSDMHandler from './sdm';

export default function createEventHandlers(
  userDataSource: UserDataSource,
  eventLogsDataSource: EventLogsDataSource
) {
  return [
    createEmailHandler(userDataSource),
    createLoggingHandler(eventLogsDataSource),
  ];
}
