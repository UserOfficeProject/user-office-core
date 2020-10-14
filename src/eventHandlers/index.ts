import { EventLogsDataSource } from '../datasources/EventLogsDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import createEmailHandler from './email';
import createLoggingHandler from './logging';
import createMessageBrokerHandler from './messageBroker';

export default function createEventHandlers({
  userDataSource,
  eventLogsDataSource,
  reviewDataSource,
  instrumentDataSource,
}: {
  userDataSource: UserDataSource;
  eventLogsDataSource: EventLogsDataSource;
  reviewDataSource: ReviewDataSource;
  instrumentDataSource: InstrumentDataSource;
}) {
  return [
    createEmailHandler(userDataSource),
    createLoggingHandler(eventLogsDataSource),
    createMessageBrokerHandler({
      instrumentDataSource,
      reviewDataSource,
    }),
  ];
}
