import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { EventLogsDataSource } from '../datasources/EventLogsDataSource';
import { FapDataSource } from '../datasources/FapDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';

export default function createHandler() {
  const eventLogsDataSource = container.resolve<EventLogsDataSource>(
    Tokens.EventLogsDataSource
  );
  const proposalSettingsDataSource =
    container.resolve<ProposalSettingsDataSource>(
      Tokens.ProposalSettingsDataSource
    );
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);

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
        case Event.PROPOSAL_INSTRUMENT_SELECTED: {
          await Promise.all(
            event.instrumenthasproposals.proposalPks.map(async (proposalPk) => {
              const instrument =
                await instrumentDataSource.getInstrumentByProposalPk(
                  proposalPk
                );

              const description = `Selected instrument: ${instrument?.name}`;

              return eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                proposalPk.toString(),
                description
              );
            })
          );
          break;
        }
        case Event.PROPOSAL_FAP_SELECTED:
          await Promise.all(
            event.proposalpks.proposalPks.map(async (proposalPk) => {
              const fap = await fapDataSource.getFapByProposalPk(proposalPk);

              const description = `Selected Fap: ${fap?.code}`;

              return eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                proposalPk.toString(),
                description
              );
            })
          );
          break;
        case Event.PROPOSAL_STATUS_CHANGED_BY_USER:
          await Promise.all(
            event.proposals.proposals.map(async (proposal) => {
              const proposalStatus =
                await proposalSettingsDataSource.getProposalStatus(
                  proposal.statusId
                );

              const description = `Status changed to: ${proposalStatus?.name}`;

              return eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                proposal.primaryKey.toString(),
                description
              );
            })
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
        case Event.PROPOSAL_FAP_MEETING_SAVED:
        case Event.PROPOSAL_FAP_MEETING_RANKING_OVERWRITTEN:
        case Event.PROPOSAL_FAP_MEETING_REORDER:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            event.fapmeetingdecision.proposalPk.toString()
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
        default: {
          const changedObjectId =
            typeof (event as any)[event.key].id === 'number'
              ? (event as any)[event.key].id
              : (event as any)[event.key].primaryKey;
          const description = event.description || '';

          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            changedObjectId.toString(),
            description
          );
          break;
        }
      }
    } catch (error) {
      logger.logException(`Error handling logs for event ${event.type}`, error);
    }
  };
}
