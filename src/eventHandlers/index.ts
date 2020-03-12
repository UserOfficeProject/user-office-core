import { UserDataSource } from '../datasources/UserDataSource';
import createEmailHandler from './email';
import createLoggingHandler from './logging';
// import createSDMHandler from './sdm';
import { EventLogsDataSource } from '../datasources/EventLogsDataSource';

export default function createEventHandlers(
  userDataSource: UserDataSource,
  eventLogsDataSource: EventLogsDataSource
) {
  return [
    createEmailHandler(userDataSource),
    createLoggingHandler(eventLogsDataSource),
  ];
}
