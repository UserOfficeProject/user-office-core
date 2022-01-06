import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { EventLogsDataSource } from '../datasources/EventLogsDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';

export default function createHandler() {
  const eventLogsDataSource = container.resolve<EventLogsDataSource>(
    Tokens.EventLogsDataSource
  );

  // Handler that logs every mutation wrapped with the event bus event to logger and event_logs table.
  return async function loggingHandler(event: ApplicationEvent) {
    const json = JSON.stringify(event);
    logger.logInfo('An event was triggered', { json });

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
        case Event.PROPOSAL_STATUS_UPDATED:
          event.proposalpkswithnextstatus.proposalPks.forEach(
            async (proposalPk) => {
              await eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                proposalPk.toString()
              );
            }
          );
          break;
        case Event.PROPOSAL_INSTRUMENT_SUBMITTED:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            event.instrumenthasproposals.instrumentId.toString()
          );
          break;
        case Event.PROPOSAL_SEP_REVIEW_UPDATED:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            event.reviewwithnextproposalstatus.id.toString()
          );
          break;
        case Event.PROPOSAL_SEP_MEETING_SAVED:
        case Event.PROPOSAL_SEP_MEETING_RANKING_OVERWRITTEN:
        case Event.PROPOSAL_SEP_MEETING_REORDER:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            event.sepmeetingdecision.proposalPk.toString()
          );
          break;
        case Event.TOPIC_ANSWERED:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            event.questionarystep.questionaryId.toString()
          );
          break;
        default:
          const changedObjectId =
            (event as any)[event.key].id ||
            (event as any)[event.key].primaryKey;
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            changedObjectId.toString()
          );
          break;
      }
    } catch (error) {
      logger.logException(`Error handling logs for event ${event.type}`, error);
    }
  };
}
