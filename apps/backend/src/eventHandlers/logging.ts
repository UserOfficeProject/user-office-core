/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CoProposerClaimDataSource } from '../datasources/CoProposerClaimDataSource';
import { EventLogsDataSource } from '../datasources/EventLogsDataSource';
import { FapDataSource } from '../datasources/FapDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { StatusDataSource } from '../datasources/StatusDataSource';
import { TechniqueDataSource } from '../datasources/TechniqueDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';

export default function createLoggingHandler() {
  const eventLogsDataSource = container.resolve<EventLogsDataSource>(
    Tokens.EventLogsDataSource
  );

  const statusDataSource = container.resolve<StatusDataSource>(
    Tokens.StatusDataSource
  );
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);

  const techniqueDataSource = container.resolve<TechniqueDataSource>(
    Tokens.TechniqueDataSource
  );

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const coProposerClaimDataSource =
    container.resolve<CoProposerClaimDataSource>(
      Tokens.CoProposerClaimDataSource
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
        case Event.EMAIL_INVITE_LEGACY:
          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            event.emailinviteresponse.userId.toString()
          );
          break;
        case Event.EMAIL_INVITE:
        case Event.EMAIL_INVITES:
        case Event.INVITE_ACCEPTED:
          let invites;
          if ('invite' in event) {
            invites = [event.invite];
          } else {
            invites = event.array;
          }
          for (const invite of invites) {
            await eventLogsDataSource.set(
              event.loggedInUserId,
              event.type,
              json,
              invite.id.toString(),
              event.type === Event.INVITE_ACCEPTED
                ? `Invite accepted: ${invite.email}`
                : `Invite sent: ${invite.email}`
            );
          }
          break;

        case Event.PROPOSAL_CO_PROPOSER_CLAIM_SENT:
        case Event.PROPOSAL_CO_PROPOSER_CLAIM_ACCEPTED: {
          let invites;
          if ('invite' in event) {
            invites = [event.invite];
          } else {
            invites = event.array;
          }
          for (const invite of invites) {
            const coProposerInvites =
              await coProposerClaimDataSource.findByInviteId(invite.id);

            await Promise.all(
              coProposerInvites.map(async (coProposerInvite) => {
                return eventLogsDataSource.set(
                  event.loggedInUserId,
                  event.type,
                  json,
                  coProposerInvite.proposalPk.toString(),
                  event.type === Event.PROPOSAL_CO_PROPOSER_CLAIM_ACCEPTED
                    ? `Co-proposer invite accepted: ${invite.email}`
                    : `Co-proposer invite sent: ${invite.email}`
                );
              })
            );
          }

          break;
        }
        case Event.PROPOSAL_INSTRUMENTS_SELECTED: {
          await Promise.all(
            event.instrumentshasproposals.proposalPks.map(
              async (proposalPk) => {
                const instruments =
                  await instrumentDataSource.getInstrumentsByProposalPk(
                    proposalPk
                  );

                const description = `Selected instruments: ${instruments
                  ?.map((instrument) => instrument.name)
                  .join(', ')}`;

                return eventLogsDataSource.set(
                  event.loggedInUserId,
                  event.type,
                  json,
                  proposalPk.toString(),
                  description,
                  event.impersonatingUserId
                );
              }
            )
          );
          break;
        }
        case Event.PROPOSAL_FAPS_SELECTED: {
          await Promise.all(
            event.proposalpks.proposalPks.map(async (proposalPk) => {
              const faps = await fapDataSource.getFapsByProposalPk(proposalPk);

              const description = `Selected FAPs: ${faps
                ?.map((fap) => fap.code)
                .join(', ')}`;

              return eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                proposalPk.toString(),
                description,
                event.impersonatingUserId
              );
            })
          );
          break;
        }
        case Event.PROPOSAL_FAPS_REMOVED: {
          const key = 'proposalPk';
          const uniqueFapProposals = [
            ...new Map(event.array.map((item) => [item[key], item])).values(),
          ];

          await Promise.all(
            uniqueFapProposals.map(async (fapProposal) => {
              const description = 'All proposal FAPs removed';

              return eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                fapProposal.proposalPk.toString(),
                description,
                event.impersonatingUserId
              );
            })
          );
          break;
        }
        case Event.PROPOSAL_STATUS_CHANGED_BY_USER:
          await Promise.all(
            event.proposals.proposals.map(async (proposal) => {
              const proposalStatus = await statusDataSource.getStatus(
                proposal.statusId
              );

              const description = `Status changed to: ${proposalStatus?.name}`;

              return eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                proposal.primaryKey.toString(),
                description,
                event.impersonatingUserId
              );
            })
          );
          break;
        case Event.PROPOSAL_FAP_MEETING_INSTRUMENT_SUBMITTED:
        case Event.PROPOSAL_FAP_MEETING_INSTRUMENT_UNSUBMITTED:
          const [instrumentId] = event.instrumentshasproposals.instrumentIds;
          const instrument =
            await instrumentDataSource.getInstrument(instrumentId);

          let description = `Submitted instrument: ${instrument?.name}`;
          if (
            event.type === Event.PROPOSAL_FAP_MEETING_INSTRUMENT_UNSUBMITTED
          ) {
            description = `Unsubmitted instrument: ${instrument?.name}`;
          }

          await Promise.all(
            event.instrumentshasproposals.proposalPks.map(
              async (proposalPk) => {
                return eventLogsDataSource.set(
                  event.loggedInUserId,
                  event.type,
                  json,
                  proposalPk.toString(),
                  description,
                  event.impersonatingUserId
                );
              }
            )
          );

          break;
        case Event.PROPOSAL_ALL_FAP_MEETING_INSTRUMENT_SUBMITTED: {
          const instrumentIds = event.instrumentshasproposals.instrumentIds;
          const instruments =
            await instrumentDataSource.getInstrumentsByIds(instrumentIds);

          const description = `Submitted instrument${instruments.length > 1 ? 's' : ''}: ${instruments?.map((i) => i.name).join(', ')}`;

          await Promise.all(
            event.instrumentshasproposals.proposalPks.map(
              async (proposalPk) => {
                return eventLogsDataSource.set(
                  event.loggedInUserId,
                  event.type,
                  json,
                  proposalPk.toString(),
                  description,
                  event.impersonatingUserId
                );
              }
            )
          );

          break;
        }
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
            event.array.at(0)?.questionaryId.toString() ??
              'Questionary ID not found'
          );
          break;
        case Event.INSTRUMENTS_REMOVED_FROM_TECHNIQUE:
          {
            let description = '';
            if (event.boolean && event.inputArgs) {
              const obj = JSON.parse(event.inputArgs);
              const instruments =
                await instrumentDataSource.getInstrumentsByIds(
                  obj[0].instrumentIds
                );

              const technique = await techniqueDataSource.getTechnique(
                obj[0].techniqueId
              );

              description = `Selected instruments: ${instruments?.map((instrument) => instrument.name).join(', ')} is removed from technique: ${technique?.name}`;

              await eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                obj[0].techniqueId,
                description,
                event.impersonatingUserId
              );
            }
          }
          break;
        case Event.INSTRUMENTS_ASSIGNED_TO_TECHNIQUE:
          {
            let description = '';
            if (event.boolean && event.inputArgs) {
              const obj = JSON.parse(event.inputArgs);
              const instruments =
                await instrumentDataSource.getInstrumentsByIds(
                  obj[0].instrumentIds
                );

              const technique = await techniqueDataSource.getTechnique(
                obj[0].techniqueId
              );

              description = `Selected instruments: ${instruments?.map((instrument) => instrument.name).join(', ')} is attached to technique: ${technique?.name}`;

              await eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                obj[0].techniqueId,
                description,
                event.impersonatingUserId
              );
            }
          }
          break;
        case Event.PROPOSAL_ASSIGNED_TO_TECHNIQUES:
          {
            let description = '';
            if (event.boolean && event.inputArgs) {
              const obj = JSON.parse(event.inputArgs);
              const techniques = await techniqueDataSource.getTechniquesByIds(
                obj[0].techniqueIds
              );

              const proposal = await proposalDataSource.get(obj[0].proposalPk);

              description = `Selected techniques: ${techniques?.map((technique) => technique.name).join(', ')} is attached to proposal: ${proposal?.proposalId}`;

              await eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                obj[0].proposalPk,
                description,
                event.impersonatingUserId
              );
            }
          }
          break;

        case Event.VISIT_REGISTRATION_APPROVED:
          {
            if (event.visitregistration) {
              const description = 'Visit registration approved';
              await eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                event.visitregistration.visitId.toString(),
                description,
                event.impersonatingUserId
              );
            }
          }
          break;
        case Event.VISIT_REGISTRATION_CANCELLED:
          {
            if (event.visitregistration) {
              const description = 'Visit registration cancelled';
              await eventLogsDataSource.set(
                event.loggedInUserId,
                event.type,
                json,
                event.visitregistration.visitId.toString(),
                description,
                event.impersonatingUserId
              );
            }
          }
          break;
        default: {
          let changedObjectId: number;
          if (typeof (event as any)[event.key].primaryKey === 'number') {
            changedObjectId = (event as any)[event.key].primaryKey;
          } else if (typeof (event as any)[event.key].proposalPk === 'number') {
            changedObjectId = (event as any)[event.key].proposalPk;
          } else {
            changedObjectId = (event as any)[event.key].id;
          }
          const description = event.description || '';

          await eventLogsDataSource.set(
            event.loggedInUserId,
            event.type,
            json,
            changedObjectId.toString(),
            description,
            event.impersonatingUserId
          );
          break;
        }
      }
    } catch (error) {
      logger.logException(`Error handling logs for event ${event.type}`, error);
    }
  };
}

export const createSkipLoggingHandler = () => {
  return async function skipLoggingHandler(event: ApplicationEvent) {
    logger.logInfo('Skip logging event', { type: event.type });
  };
};
