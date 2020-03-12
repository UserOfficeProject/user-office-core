import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { EventLogsDataSource } from '../datasources/EventLogsDataSource';

export default function createHandler(
  eventLogsDataSource: EventLogsDataSource
) {
  // Handler that logs every mutation wrapped with the event bus event to stdout and event_logs table.
  return async function loggingHandler(event: ApplicationEvent) {
    const json = JSON.stringify(event);
    const timestamp = new Date().toLocaleString();
    console.log(`${timestamp} -- ${json}`);

    switch (event.type) {
      case Event.PROPOSAL_CREATED:
      // NOTE: For now we are skipping the PROPOSAL_UPDATED event.
      // case Event.PROPOSAL_UPDATED:
      case Event.PROPOSAL_SUBMITTED:
      case Event.PROPOSAL_ACCEPTED:
      case Event.PROPOSAL_REJECTED:
        await eventLogsDataSource.set(
          event.loggedInUserId,
          event.type,
          json,
          event.proposal.id.toString()
        );
        break;

      case Event.USER_CREATED:
      case Event.USER_UPDATED:
      case Event.USER_PASSWORD_RESET_EMAIL:
        await eventLogsDataSource.set(
          event.loggedInUserId,
          event.type,
          json,
          event.user.id.toString()
        );
        break;
      default:
        break;
    }
  };
}
