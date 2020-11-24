/* eslint-disable @typescript-eslint/camelcase */
import { proposalDataSource } from '../datasources';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { eventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { SampleStatus } from '../models/Sample';
import { TechnicalReviewStatus } from '../models/TechnicalReview';
import { logger } from '../utils/Logger';
import { workflowEngine, WorkflowEngineProposalType } from '../workflowEngine';

export default function createHandler(proposalDatasource: ProposalDataSource) {
  // Handler to align input for workflowEngine

  return async function proposalWorkflowHandler(event: ApplicationEvent) {
    // if the original method failed
    // there is no point of sending any email
    if (event.isRejection) {
      return;
    }

    const markProposalEventAsDoneAndCallWorkflowEngine = async (
      eventType: Event,
      proposal: WorkflowEngineProposalType
    ) => {
      const allProposalEvents = await proposalDatasource.markEventAsDoneOnProposal(
        eventType,
        proposal.id
      );

      await workflowEngine({
        ...proposal,
        proposalEvents: allProposalEvents,
      });
    };

    switch (event.type) {
      case Event.PROPOSAL_CREATED:
        try {
          await proposalDatasource.markEventAsDoneOnProposal(
            event.type,
            event.proposal.id
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.proposal.id}: `,
            error
          );
        }
        break;
      case Event.PROPOSAL_INSTRUMENT_SELECTED:
      case Event.PROPOSAL_SEP_SELECTED:
        try {
          await Promise.all(
            event.proposalids.proposalIds.map(async proposalId => {
              const proposal = await proposalDataSource.get(proposalId);

              if (proposal?.id) {
                return await markProposalEventAsDoneAndCallWorkflowEngine(
                  event.type,
                  proposal
                );
              }
            })
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.proposalids.proposalIds}: `,
            error
          );
        }

        break;
      case Event.PROPOSAL_SUBMITTED:
      case Event.PROPOSAL_FEASIBLE:
      case Event.PROPOSAL_SAMPLE_SAFE:
      case Event.PROPOSAL_NOTIFIED:
      case Event.PROPOSAL_ACCEPTED:
      case Event.PROPOSAL_REJECTED:
      case Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED:
      case Event.PROPOSAL_SEP_MEETING_SUBMITTED:
        try {
          await markProposalEventAsDoneAndCallWorkflowEngine(
            event.type,
            event.proposal
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.proposal.id}: `,
            error
          );
        }

        break;
      case Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED:
        try {
          const proposal = await proposalDataSource.get(
            event.technicalreview.proposalID
          );

          if (!proposal || !proposal.id) {
            throw new Error(
              `Proposal with id ${event.technicalreview.proposalID} not found`
            );
          }

          switch (event.technicalreview.status) {
            // TODO: Review this if both feasible and partialy feasible should emit PROPOSAL_FEASIBLE
            case TechnicalReviewStatus.FEASIBLE:
            case TechnicalReviewStatus.PARTIALLY_FEASIBLE:
              eventBus.publish({
                type: Event.PROPOSAL_FEASIBLE,
                proposal,
                isRejection: false,
                key: 'proposal',
                loggedInUserId: event.loggedInUserId,
              });
              break;
            default:
              break;
          }

          await markProposalEventAsDoneAndCallWorkflowEngine(
            event.type,
            proposal
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.technicalreview.proposalID}: `,
            error
          );
        }

        break;
      case Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED:
        try {
          const proposal = await proposalDataSource.get(
            event.sample.proposalId
          );

          if (!proposal || !proposal.id) {
            throw new Error(
              `Proposal with id ${event.sample.proposalId} not found`
            );
          }

          switch (event.sample.safetyStatus) {
            // TODO: Review this if both LOW_RISK and ELEVATED_RISK should emit PROPOSAL_SAMPLE_SAFE
            case SampleStatus.LOW_RISK:
            case SampleStatus.ELEVATED_RISK:
              eventBus.publish({
                type: Event.PROPOSAL_SAMPLE_SAFE,
                proposal,
                isRejection: false,
                key: 'proposal',
                loggedInUserId: event.loggedInUserId,
              });
              break;
            default:
              break;
          }

          await markProposalEventAsDoneAndCallWorkflowEngine(
            event.type,
            proposal
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.sample.proposalId}: `,
            error
          );
        }
        break;
      case Event.PROPOSAL_SEP_REVIEW_SUBMITTED:
        try {
          const proposal = await proposalDataSource.get(
            event.review.proposalID
          );

          if (!proposal || !proposal.id) {
            throw new Error(
              `Proposal with id ${event.review.proposalID} not found`
            );
          }

          await markProposalEventAsDoneAndCallWorkflowEngine(
            event.type,
            proposal
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.review.proposalID}: `,
            error
          );
        }
        break;
      case Event.CALL_ENDED:
      case Event.CALL_REVIEW_ENDED:
      case Event.CALL_SEP_REVIEW_ENDED:
        try {
          const allProposalsOnCall = await proposalDataSource.getProposalsFromView(
            { callId: event.call.id }
          );

          if (allProposalsOnCall && allProposalsOnCall.length) {
            await Promise.all(
              allProposalsOnCall.map(
                async proposalOnCall =>
                  await markProposalEventAsDoneAndCallWorkflowEngine(
                    event.type,
                    proposalOnCall
                  )
              )
            );
          }
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine on proposals with callId = ${event.call.id}: `,
            error
          );
        }

        break;

      case Event.PROPOSAL_INSTRUMENT_SUBMITTED:
        try {
          const allProposalsOnCallWithInstrument = await proposalDataSource.getProposalsFromView(
            {
              callId: event.callhasinstrument.callId,
              instrumentId: event.callhasinstrument.instrumentId,
            }
          );

          if (allProposalsOnCallWithInstrument?.length) {
            await Promise.all(
              allProposalsOnCallWithInstrument.map(
                async proposalOnCall =>
                  await markProposalEventAsDoneAndCallWorkflowEngine(
                    event.type,
                    proposalOnCall
                  )
              )
            );
          }
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine on proposals with callId = ${event.callhasinstrument.callId}: `,
            error
          );
        }

        break;
    }
  };
}
