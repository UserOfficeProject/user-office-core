import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { eventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { Proposal, ProposalEndStatus } from '../models/Proposal';
import { ReviewStatus } from '../models/Review';
import { SampleStatus } from '../models/Sample';
import { TechnicalReviewStatus } from '../models/TechnicalReview';
import {
  checkAllReviewsSubmittedOnProposal,
  searchObjectByKey,
} from '../utils/helperFunctions';
import {
  markProposalEventAsDoneAndCallWorkflowEngine,
  WorkflowEngineProposalType,
} from '../workflowEngine';

const keysToLookFor = ['proposal', 'proposalPks', 'proposalPk'];

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

    const handleWorkflowEngineChange = async (
      eventType: Event,
      proposal: WorkflowEngineProposalType
    ) => {
      const updatedProposals =
        await markProposalEventAsDoneAndCallWorkflowEngine(eventType, proposal);

      if (updatedProposals) {
        updatedProposals.forEach(
          (updatedProposal) =>
            updatedProposal &&
            eventBus.publish({
              type: Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW,
              proposal: updatedProposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            })
        );
      }
    };

    // TODO: Make this part nicer.
    let result;
    let foundKey;

    for (const key of keysToLookFor) {
      result = searchObjectByKey(event, key);

      if (result && result[key as keyof object]) {
        foundKey = key;
        break;
      }
    }
    let foundProposal: Proposal | null;

    const foundKeyValue = result?.[foundKey as keyof object];

    if (foundKeyValue) {
      switch (foundKey) {
        case 'proposalPks':
          await Promise.all(
            (foundKeyValue as number[]).map(async (proposalPk) => {
              const proposal = await proposalDataSource.get(proposalPk);

              if (proposal?.primaryKey) {
                await handleWorkflowEngineChange(event.type, proposal);

                if (event.type === Event.PROPOSAL_STATUS_UPDATED) {
                  eventBus.publish({
                    type: Event.PROPOSAL_STATUS_CHANGED_BY_USER,
                    proposal: proposal,
                    isRejection: false,
                    key: 'proposal',
                    loggedInUserId: event.loggedInUserId,
                  });
                }
              }
            })
          );
          break;
        case 'proposal':
          await handleWorkflowEngineChange(event.type, foundKeyValue);
          break;
        case 'proposalPk':
          foundProposal = await proposalDataSource.get(foundKeyValue);

          if (!foundProposal) {
            throw new Error(`Proposal with id ${foundKeyValue} not found`);
          }

          await handleWorkflowEngineChange(event.type, foundProposal);
          break;

        default:
          break;
      }
    }

    // TODO: This is custom event handlers that we must keep.
    // Maybe it is a good idea to move them out into a separate event handler for custom handling.
    // Not to be part of proposal workflow handler.
    switch (event.type) {
      case Event.PROPOSAL_MANAGEMENT_DECISION_UPDATED:
        if (event.proposal.managementDecisionSubmitted) {
          eventBus.publish({
            type: Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED,
            proposal: event.proposal,
            isRejection: false,
            key: 'proposal',
            loggedInUserId: event.loggedInUserId,
          });
        }
        break;
      case Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED:
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
          case ProposalEndStatus.RESERVED:
            eventBus.publish({
              type: Event.PROPOSAL_RESERVED,
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
        break;
      case Event.PROPOSAL_FEASIBILITY_REVIEW_UPDATED:
        if (event.technicalreview.submitted) {
          eventBus.publish({
            type: Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED,
            technicalreview: event.technicalreview,
            isRejection: false,
            key: 'technicalreview',
            loggedInUserId: event.loggedInUserId,
          });
        }
        break;
      case Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED:
        switch (event.technicalreview.status) {
          case TechnicalReviewStatus.FEASIBLE:
            eventBus.publish({
              type: Event.PROPOSAL_FEASIBLE,
              proposal: foundProposal!,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
            break;
          case TechnicalReviewStatus.UNFEASIBLE:
            eventBus.publish({
              type: Event.PROPOSAL_UNFEASIBLE,
              proposal: foundProposal!,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
            break;
          default:
            break;
        }
        break;
      case Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED:
        switch (event.sample.safetyStatus) {
          case SampleStatus.LOW_RISK:
            eventBus.publish({
              type: Event.PROPOSAL_SAMPLE_SAFE,
              proposal: foundProposal!,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
            break;
          default:
            break;
        }
        break;
      case Event.PROPOSAL_SEP_MEETING_SAVED:
        if (event.sepmeetingdecision.submitted) {
          eventBus.publish({
            type: Event.PROPOSAL_SEP_MEETING_SUBMITTED,
            proposal: foundProposal!,
            isRejection: false,
            key: 'proposal',
            loggedInUserId: event.loggedInUserId,
          });
        }
        break;
      case Event.PROPOSAL_SEP_REVIEW_UPDATED:
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
        break;

      case Event.PROPOSAL_SEP_REVIEW_SUBMITTED:
        try {
          const allProposalReviews = await reviewDataSource.getProposalReviews(
            event.review.proposalPk
          );

          const allOtherReviewsSubmitted = checkAllReviewsSubmittedOnProposal(
            allProposalReviews,
            event.review
          );

          if (allOtherReviewsSubmitted) {
            eventBus.publish({
              type: Event.PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED,
              proposal: foundProposal!,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
          }
        } catch (error) {
          logger.logException(
            `Error while trying to mark ${event.type} event as done and calling workflow engine with ${event.review.proposalPk}: `,
            error
          );
        }
        break;
      case Event.CALL_ENDED:
      case Event.CALL_REVIEW_ENDED:
      case Event.CALL_SEP_REVIEW_ENDED:
        try {
          const allProposalsOnCall =
            await proposalDataSource.getProposalsFromView({
              callId: event.call.id,
            });

          if (allProposalsOnCall && allProposalsOnCall.proposalViews.length) {
            await Promise.all(
              allProposalsOnCall.proposalViews.map(
                async (proposalOnCall) =>
                  await handleWorkflowEngineChange(event.type, proposalOnCall)
              )
            );
          }
        } catch (error) {
          logger.logException(
            `Error while trying to mark ${event.type} event as done and calling workflow engine on proposals with callId = ${event.call.id}: `,
            error
          );
        }

        break;
    }
  };
}
