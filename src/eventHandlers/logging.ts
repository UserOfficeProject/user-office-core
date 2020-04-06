import { EventLogsDataSource } from '../datasources/EventLogsDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';

export default function createHandler(
  eventLogsDataSource: EventLogsDataSource
) {
  // Handler that logs every mutation wrapped with the event bus event to stdout and event_logs table.
  return async function loggingHandler(event: ApplicationEvent) {
    const json = JSON.stringify(event);
    const timestamp = new Date().toLocaleString();
    console.log(`${timestamp} -- ${json}`);

    // NOTE: If the event is rejection than log that in the database as well. Later we will be able to see all errors that happened.
    if (event.isRejection) {
      await eventLogsDataSource.set(
        event.loggedInUserId,
        event.type,
        json,
        'error'
      );

      return;
    }

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
        await eventLogsDataSource.set(
          event.loggedInUserId,
          event.type,
          json,
          event.user.id.toString()
        );
        break;
      case Event.USER_PASSWORD_RESET_EMAIL:
        await eventLogsDataSource.set(
          event.loggedInUserId,
          event.type,
          json,
          event.resetpasswordresponse.user.id.toString()
        );
        break;
      case Event.SEP_CREATED:
      case Event.SEP_UPDATED:
        await eventLogsDataSource.set(
          event.loggedInUserId,
          event.type,
          json,
          event.sep.id.toString()
        );
        break;
      case Event.EMAIL_INVITE:
        await eventLogsDataSource.set(
          event.loggedInUserId,
          event.type,
          json,
          event.userId.toString()
        );
        break;
      default:
        break;
    }
  };
}
