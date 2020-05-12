import { EventLogsDataSource } from '../datasources/EventLogsDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { logger } from '../utils/Logger';

export default function createHandler(
  eventLogsDataSource: EventLogsDataSource
) {
  // Handler that logs every mutation wrapped with the event bus event to stdout and event_logs table.
  return async function loggingHandler(event: ApplicationEvent) {
    const json = JSON.stringify(event);
    const timestamp = new Date().toLocaleString();
    console.log(`${timestamp} -- ${json}`);

    // NOTE: If the event is rejection and the reason is `INTERNAL_ERROR` than log that in the database as well. Later we will be able to see all errors that happened.
    if (!!event.rejection) {
      // NOTE: Do not log cron-job service rejections
      if (event.rejection !== 'NO_INACTIVE_USERS') {
        await eventLogsDataSource.set(
          event.loggedInUserId,
          event.type,
          json,
          'error'
        );
      }

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
        case Event.USERS_DELETED_INACTIVE:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            (event as any)[event.key]
              .map((user: any) => user.id)
              .join('_')
              .toString()
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
