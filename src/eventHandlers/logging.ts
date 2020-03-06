import { ApplicationEvent } from '../events/applicationEvents';
import { EventLogsDataSource } from '../datasources/EventLogsDataSource';

export default function createHandler(
  eventLogsDataSource: EventLogsDataSource
) {
  // Handler that logs every wrapped with the event bus event to stdout and event_logs table.
  return async function loggingHandler(event: ApplicationEvent) {
    const json = JSON.stringify(event);
    const timestamp = new Date().toLocaleString();
    console.log(`${timestamp} -- ${json}`);

    switch (event.type) {
      case 'PROPOSAL_CREATED':
      case 'PROPOSAL_UPDATED':
      case 'PROPOSAL_SUBMITTED':
      case 'PROPOSAL_ACCEPTED':
      case 'PROPOSAL_REJECTED':
        await eventLogsDataSource.set(
          event.loggedInUserId,
          event.type,
          json,
          event.proposal.id
        );
        break;

      case 'USER_CREATED':
      case 'USER_UPDATED':
        await eventLogsDataSource.set(
          event.loggedInUserId,
          event.type,
          json,
          event.user.id
        );
        break;
      default:
        break;
    }
  };
}
