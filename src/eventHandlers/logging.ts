import { logger } from '@esss-swap/duo-logger';

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

    // NOTE: We need to have custom checks for events where response is not standard one.
    try {
      switch (event.type) {
        case Event.USER_CREATED:
        case Event.USER_PASSWORD_RESET_EMAIL:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            event.userlinkresponse.user.id.toString()
          );
          break;
        case Event.EMAIL_INVITE:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            event.emailinviteresponse.userId.toString()
          );
          break;
        case Event.PROPOSAL_INSTRUMENT_SELECTED:
        case Event.PROPOSAL_SEP_SELECTED:
          event.proposalids.proposalIds.forEach(async proposalId => {
            await eventLogsDataSource.set(
              event.loggedInUserId,
              event.type,
              json,
              proposalId.toString()
            );
          });
          break;
        case Event.PROPOSAL_INSTRUMENT_SUBMITTED:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            event.instrumenthasproposals.instrumentId.toString()
          );
          break;
        default:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            (event as any)[event.key].id.toString()
          );
          break;
      }
    } catch (error) {
      logger.logError(error.message, error);
    }
  };
}
