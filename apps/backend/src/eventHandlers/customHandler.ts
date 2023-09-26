import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { ProposalEndStatus } from '../models/Proposal';
import { ReviewStatus } from '../models/Review';
import { SampleStatus } from '../models/Sample';
import { TechnicalReviewStatus } from '../models/TechnicalReview';
import { checkAllReviewsSubmittedOnProposal } from '../utils/helperFunctions';
import { handleWorkflowEngineChange } from './proposalWorkflow';

export default function createCustomHandler() {
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const reviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );

  const getProposalByPk = async (proposalPk: number) => {
    const foundProposal = await proposalDataSource.get(proposalPk);

    if (!foundProposal) {
      throw new Error(`Proposal with id ${proposalPk} not found`);
    }

    return foundProposal;
  };

  // Handler for custom events that need special treatment
  return async function customHandler(event: ApplicationEvent) {
    // if the original method failed
    // there is no point of moving forward
    if (event.isRejection) {
      return;
    }

    const eventBus = resolveApplicationEventBus();
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
      case Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED: {
        const foundProposal = await getProposalByPk(
          event.technicalreview.proposalPk
        );

        switch (event.technicalreview.status) {
          case TechnicalReviewStatus.FEASIBLE:
            eventBus.publish({
              type: Event.PROPOSAL_FEASIBLE,
              proposal: foundProposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
            break;
          case TechnicalReviewStatus.UNFEASIBLE:
            eventBus.publish({
              type: Event.PROPOSAL_UNFEASIBLE,
              proposal: foundProposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
            break;
          default:
            break;
        }
        break;
      }
      case Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED: {
        const foundProposal = await getProposalByPk(event.sample.proposalPk);

        switch (event.sample.safetyStatus) {
          case SampleStatus.LOW_RISK:
            eventBus.publish({
              type: Event.PROPOSAL_SAMPLE_SAFE,
              proposal: foundProposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
            break;
          default:
            break;
        }
        break;
      }
      case Event.PROPOSAL_SEP_MEETING_SAVED: {
        const foundProposal = await getProposalByPk(
          event.sepmeetingdecision.proposalPk
        );

        if (event.sepmeetingdecision.submitted) {
          eventBus.publish({
            type: Event.PROPOSAL_SEP_MEETING_SUBMITTED,
            proposal: foundProposal,
            isRejection: false,
            key: 'proposal',
            loggedInUserId: event.loggedInUserId,
          });
        }
        break;
      }
      case Event.PROPOSAL_SEP_REVIEW_UPDATED:
        if (event.review.status === ReviewStatus.SUBMITTED) {
          eventBus.publish({
            type: Event.PROPOSAL_SEP_REVIEW_SUBMITTED,
            review: event.review,
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
            const foundProposal = await getProposalByPk(
              event.review.proposalPk
            );

            eventBus.publish({
              type: Event.PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED,
              proposal: foundProposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
          }
        } catch (error) {
          logger.logException(
            `Error while trying to handle ${event.type} event for proposal: ${event.review.proposalPk}: `,
            error
          );
        }
        break;
      case Event.CALL_ENDED:
      case Event.CALL_ENDED_INTERNAL:
      case Event.CALL_REVIEW_ENDED:
      case Event.CALL_SEP_REVIEW_ENDED:
        try {
          const allProposalsOnCall =
            await proposalDataSource.getProposalsFromView({
              callId: event.call.id,
            });

          if (allProposalsOnCall && allProposalsOnCall.proposalViews.length) {
            const proposalPks = allProposalsOnCall.proposalViews.map(
              (proposal) => proposal.primaryKey
            );
            handleWorkflowEngineChange(event, proposalPks);
          }
        } catch (error) {
          logger.logException(
            `Error while trying to mark ${event.type} event as done and calling workflow engine on proposals with callId ${event.call.id}: `,
            error
          );
        }

        break;
    }
  };
}
