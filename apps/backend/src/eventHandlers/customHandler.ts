import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FapDataSource } from '../datasources/FapDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
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
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const reviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);

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
      case Event.PROPOSAL_FAP_MEETING_INSTRUMENT_SUBMITTED: {
        const foundProposals = await proposalDataSource.getProposalsByPks(
          event.instrumentshasproposals.proposalPks
        );

        for (const proposal of foundProposals) {
          const instruments =
            await instrumentDataSource.getInstrumentsByProposalPk(
              proposal.primaryKey
            );

          if (!instruments.length) {
            break;
          }

          const instrumentHasProposals =
            await instrumentDataSource.getInstrumentsHasProposal(
              instruments.map((i) => i.id),
              proposal.primaryKey,
              proposal.callId
            );

          if (instrumentHasProposals.submitted) {
            eventBus.publish({
              type: Event.PROPOSAL_ALL_FAP_MEETING_INSTRUMENT_SUBMITTED,
              instrumentshasproposals: instrumentHasProposals,
              isRejection: false,
              key: 'instrumentshasproposals',
              loggedInUserId: event.loggedInUserId,
            });
          }
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

          const foundFap = await fapDataSource.getFap(
            event.fapmeetingdecision.fapId
          );

          const allFapProposals = await fapDataSource.getFapProposals(
            event.fapmeetingdecision.fapId,
            foundProposal.callId
          );

          const allMeetingDecisions =
            await fapDataSource.getAllFapMeetingDecisions(
              event.fapmeetingdecision.fapId
            );

          if (
            foundFap &&
            allFapProposals.length === allMeetingDecisions.length &&
            allMeetingDecisions.every((item) => item.submitted)
          ) {
            eventBus.publish({
              type: Event.FAP_ALL_MEETINGS_SUBMITTED,
              fap: foundFap,
              isRejection: false,
              key: 'fap',
              loggedInUserId: event.loggedInUserId,
            });
          }

          const allProposalFapMeetingDecisions =
            await fapDataSource.getProposalsFapMeetingDecisions([
              event.fapmeetingdecision.proposalPk,
            ]);

          const allProposalFaps = await fapDataSource.getFapsByProposalPk(
            event.fapmeetingdecision.proposalPk
          );

          if (
            allProposalFaps.length === allProposalFapMeetingDecisions.length &&
            allProposalFapMeetingDecisions.every((item) => item.submitted)
          ) {
            eventBus.publish({
              type: Event.PROPOSAL_ALL_FAP_MEETINGS_SUBMITTED,
              proposal: foundProposal,
              isRejection: false,
              key: 'proposal',
              loggedInUserId: event.loggedInUserId,
            });
          }
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
          const allFapProposalReviews =
            await reviewDataSource.getProposalReviews(
              event.review.proposalPk,
              event.review.fapID
            );

          const allOtherReviewsSubmitted = checkAllReviewsSubmittedOnProposal(
            allFapProposalReviews,
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

            // NOTE: This should fetch all the proposal reviews in all FAPs
            const allFapsProposalReviews =
              await reviewDataSource.getProposalReviews(
                event.review.proposalPk
              );

            const allProposalReviewsSubmittedInAllPanels =
              checkAllReviewsSubmittedOnProposal(
                allFapsProposalReviews,
                event.review
              );
            const allProposalAssignments =
              await fapDataSource.getAllFapProposalAssignments(
                event.review.proposalPk
              );

            if (
              allFapsProposalReviews.length >= allProposalAssignments.length &&
              allProposalReviewsSubmittedInAllPanels
            ) {
              eventBus.publish({
                type: Event.PROPOSAL_ALL_REVIEWS_SUBMITTED_FOR_ALL_FAPS,
                proposal: foundProposal,
                isRejection: false,
                key: 'proposal',
                loggedInUserId: event.loggedInUserId,
              });
            }
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
          logger.logException(
            `Error while trying to mark ${event.type} event as done and calling workflow engine on proposals with callId ${event.call.id}: `,
            error
          );
        }

        break;
      case Event.PROPOSAL_SUBMITTED:
        if (event.proposal.primaryKey) {
          await proposalDataSource.updateSubmittedDate(
            event.proposal.primaryKey
          );
        }
        break;
    }
  };
}
