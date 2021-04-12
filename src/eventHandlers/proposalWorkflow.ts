import { logger } from '@esss-swap/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { eventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { ProposalEndStatus } from '../models/Proposal';
import { ReviewStatus } from '../models/Review';
import { SampleStatus } from '../models/Sample';
import { TechnicalReviewStatus } from '../models/TechnicalReview';
import { checkAllReviewsSubmittedOnProposal } from '../utils/helperFunctions';
import { workflowEngine, WorkflowEngineProposalType } from '../workflowEngine';

export default function createHandler() {
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const reviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );

  // Handler to align input for workflowEngine

  return async function proposalWorkflowHandler(event: ApplicationEvent) {
    // if the original method failed
    // there is no point of moving forward in the workflow
    if (event.isRejection) {
      return;
    }

    const markProposalEventAsDoneAndCallWorkflowEngine = async (
      eventType: Event,
      proposal: WorkflowEngineProposalType
    ) => {
      const allProposalEvents = await proposalDataSource.markEventAsDoneOnProposal(
        eventType,
        proposal.id
      );

      await workflowEngine({
        ...proposal,
        proposalEvents: allProposalEvents,
        currentEvent: eventType,
      });
    };

    switch (event.type) {
      case Event.PROPOSAL_CREATED:
        try {
          await proposalDataSource.markEventAsDoneOnProposal(
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
      case Event.PROPOSAL_STATUS_UPDATED:
        try {
          await Promise.all(
            event.proposalidswithnextstatus.proposalIds.map(
              async (proposalId) => {
                const proposal = await proposalDataSource.get(proposalId);

                if (proposal?.id) {
                  return await markProposalEventAsDoneAndCallWorkflowEngine(
                    event.type,
                    proposal
                  );
                }
              }
            )
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.proposalidswithnextstatus.proposalIds}: `,
            error
          );
        }

        break;
      case Event.PROPOSAL_SUBMITTED:
      case Event.PROPOSAL_FEASIBLE:
      case Event.PROPOSAL_UNFEASIBLE:
      case Event.PROPOSAL_SAMPLE_SAFE:
      case Event.PROPOSAL_NOTIFIED:
      case Event.PROPOSAL_ACCEPTED:
      case Event.PROPOSAL_REJECTED:
      case Event.PROPOSAL_SEP_MEETING_SUBMITTED:
      case Event.PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED:
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
      case Event.PROPOSAL_MANAGEMENT_DECISION_UPDATED:
        try {
          if (event.proposal.managementDecisionSubmitted) {
            eventBus.publish({
              type: Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED,
              proposal: event.proposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
          }

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
      case Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED:
        try {
          switch (event.proposal.finalStatus) {
            case ProposalEndStatus.ACCEPTED:
              eventBus.publish({
                type: Event.PROPOSAL_ACCEPTED,
                proposal: event.proposal,
                isRejection: false,
                key: 'proposal',
                loggedInUserId: event.loggedInUserId,
              });
              break;
            case ProposalEndStatus.REJECTED:
              eventBus.publish({
                type: Event.PROPOSAL_REJECTED,
                proposal: event.proposal,
                isRejection: false,
                reason: event.proposal.commentForUser,
                key: 'proposal',
                loggedInUserId: event.loggedInUserId,
              });
              break;
            default:
              break;
          }

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
      case Event.PROPOSAL_FEASIBILITY_REVIEW_UPDATED:
        try {
          const proposal = await proposalDataSource.get(
            event.technicalreview.proposalID
          );

          if (!proposal) {
            throw new Error(
              `Proposal with id ${event.technicalreview.proposalID} not found`
            );
          }

          if (event.technicalreview.submitted) {
            eventBus.publish({
              type: Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED,
              technicalreview: event.technicalreview,
              isRejection: false,
              key: 'technicalreview',
              loggedInUserId: event.loggedInUserId,
            });
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
      case Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED:
        try {
          const proposal = await proposalDataSource.get(
            event.technicalreview.proposalID
          );

          if (!proposal) {
            throw new Error(
              `Proposal with id ${event.technicalreview.proposalID} not found`
            );
          }

          switch (event.technicalreview.status) {
            case TechnicalReviewStatus.FEASIBLE:
              eventBus.publish({
                type: Event.PROPOSAL_FEASIBLE,
                proposal,
                isRejection: false,
                key: 'proposal',
                loggedInUserId: event.loggedInUserId,
              });
              break;
            case TechnicalReviewStatus.UNFEASIBLE:
              eventBus.publish({
                type: Event.PROPOSAL_UNFEASIBLE,
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

          if (!proposal) {
            throw new Error(
              `Proposal with id ${event.sample.proposalId} not found`
            );
          }

          switch (event.sample.safetyStatus) {
            case SampleStatus.LOW_RISK:
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
      case Event.PROPOSAL_SEP_MEETING_RANKING_OVERWRITTEN:
      case Event.PROPOSAL_SEP_MEETING_REORDER:
        try {
          const proposal = await proposalDataSource.get(
            event.sepmeetingdecision.proposalId
          );

          if (!proposal) {
            throw new Error(
              `Proposal with id ${event.sepmeetingdecision.proposalId} not found`
            );
          }

          await markProposalEventAsDoneAndCallWorkflowEngine(
            event.type,
            proposal
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.sepmeetingdecision.proposalId}: `,
            error
          );
        }
        break;
      case Event.PROPOSAL_SEP_MEETING_SAVED:
        try {
          const proposal = await proposalDataSource.get(
            event.sepmeetingdecision.proposalId
          );

          if (!proposal) {
            throw new Error(
              `Proposal with id ${event.sepmeetingdecision.proposalId} not found`
            );
          }

          if (event.sepmeetingdecision.submitted) {
            eventBus.publish({
              type: Event.PROPOSAL_SEP_MEETING_SUBMITTED,
              proposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
          }

          await markProposalEventAsDoneAndCallWorkflowEngine(
            event.type,
            proposal
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.sepmeetingdecision.proposalId}: `,
            error
          );
        }
        break;
      case Event.PROPOSAL_SEP_REVIEW_UPDATED:
        try {
          const proposal = await proposalDataSource.get(
            event.reviewwithnextproposalstatus.proposalID
          );

          if (!proposal) {
            throw new Error(
              `Proposal with id ${event.reviewwithnextproposalstatus.proposalID} not found`
            );
          }

          if (
            event.reviewwithnextproposalstatus.status === ReviewStatus.SUBMITTED
          ) {
            eventBus.publish({
              type: Event.PROPOSAL_SEP_REVIEW_SUBMITTED,
              review: event.reviewwithnextproposalstatus,
              isRejection: false,
              key: 'review',
              loggedInUserId: event.loggedInUserId,
            });
          }

          await markProposalEventAsDoneAndCallWorkflowEngine(
            event.type,
            proposal
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.reviewwithnextproposalstatus.proposalID}: `,
            error
          );
        }
        break;

      case Event.PROPOSAL_SEP_REVIEW_SUBMITTED:
        try {
          const proposal = await proposalDataSource.get(
            event.review.proposalID
          );

          if (!proposal) {
            throw new Error(
              `Proposal with id ${event.review.proposalID} not found`
            );
          }
          const allProposalReviews = await reviewDataSource.getProposalReviews(
            proposal?.id
          );

          const allOtherReviewsSubmitted = checkAllReviewsSubmittedOnProposal(
            allProposalReviews,
            event.review
          );

          if (allOtherReviewsSubmitted) {
            eventBus.publish({
              type: Event.PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED,
              proposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
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
                async (proposalOnCall) =>
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
          await Promise.all(
            event.instrumenthasproposals.proposalIds.map(async (proposalId) => {
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
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.instrumenthasproposals.proposalIds}: `,
            error
          );
        }

        break;
    }
  };
}
