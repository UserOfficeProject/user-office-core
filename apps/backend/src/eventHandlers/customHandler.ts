import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent, EventStatus } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { EventCallback } from '../events/eventBus';
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
  return async function customHandler(
    event: ApplicationEvent,
    eventHandlerCallBack: EventCallback
  ) {
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

        const allProposalTechnicalReviews =
          await reviewDataSource.getTechnicalReviews(
            event.technicalreview.proposalPk
          );

        const allTechnicalReviewsSubmitted = allProposalTechnicalReviews?.every(
          (technicalReview) => technicalReview.submitted
        );

        if (allTechnicalReviewsSubmitted) {
          eventBus.publish({
            type: Event.PROPOSAL_ALL_FEASIBILITY_REVIEWS_SUBMITTED,
            proposal: foundProposal,
            isRejection: false,
            key: 'proposal',
            loggedInUserId: event.loggedInUserId,
          });

          const allTechnicalReviewsFeasible =
            allProposalTechnicalReviews?.every(
              (technicalReview) =>
                technicalReview.status === TechnicalReviewStatus.FEASIBLE
            );

          if (allTechnicalReviewsFeasible) {
            eventBus.publish({
              type: Event.PROPOSAL_ALL_FEASIBILITY_REVIEWS_FEASIBLE,
              proposal: foundProposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
          }
        }

        switch (event.technicalreview.status) {
          case TechnicalReviewStatus.FEASIBLE:
            eventBus.publish({
              type: Event.PROPOSAL_FEASIBILITY_REVIEW_FEASIBLE,
              proposal: foundProposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
            break;
          case TechnicalReviewStatus.UNFEASIBLE:
            eventBus.publish({
              type: Event.PROPOSAL_FEASIBILITY_REVIEW_UNFEASIBLE,
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
      case Event.PROPOSAL_FAP_MEETING_SAVED: {
        const foundProposal = await getProposalByPk(
          event.fapmeetingdecision.proposalPk
        );

        if (event.fapmeetingdecision.submitted) {
          eventBus.publish({
            type: Event.PROPOSAL_FAP_MEETING_SUBMITTED,
            proposal: foundProposal,
            isRejection: false,
            key: 'proposal',
            loggedInUserId: event.loggedInUserId,
          });
        }
        break;
      }
      case Event.PROPOSAL_FAP_REVIEW_UPDATED:
        if (event.review.status === ReviewStatus.SUBMITTED) {
          eventBus.publish({
            type: Event.PROPOSAL_FAP_REVIEW_SUBMITTED,
            review: event.review,
            isRejection: false,
            key: 'review',
            loggedInUserId: event.loggedInUserId,
          });
        }
        break;

      case Event.PROPOSAL_FAP_REVIEW_SUBMITTED:
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
              type: Event.PROPOSAL_ALL_FAP_REVIEWS_SUBMITTED,
              proposal: foundProposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
          }
        } catch (error) {
          const errorMessage = `Error while trying to handle ${event.type} event for proposal: ${event.review.proposalPk}:`;
          logger.logException(errorMessage, error);
          eventHandlerCallBack(EventStatus.FAILED, errorMessage);
        }
        break;
      case Event.CALL_ENDED:
      case Event.CALL_ENDED_INTERNAL:
      case Event.CALL_REVIEW_ENDED:
      case Event.CALL_FAP_REVIEW_ENDED:
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
          const errorMessage = `Error while trying to mark ${event.type} event as done and calling workflow engine on proposals with callId ${event.call.id}:`;
          logger.logException(errorMessage, error);
          eventHandlerCallBack(EventStatus.FAILED, errorMessage);
        }

        break;
    }
  };
}
