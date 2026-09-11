import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { Entity, GuardFn } from '../stateMachine/stateMachine';

/**
 * Returns true when every feasibility review for the proposal is marked unfeasible.
 */
export const isEveryFeasibilityReviewUnFeasibleForProposalGuard: GuardFn =
  async (entity: Entity) => {
    const reviewDataSource = container.resolve<ReviewDataSource>(
      Tokens.ReviewDataSource
    );

    const technicalReviews = await reviewDataSource.getTechnicalReviews(
      entity.id
    );

    if (!technicalReviews || technicalReviews.length === 0) {
      return false;
    }

    return technicalReviews.every(
      (technicalReview) =>
        technicalReview.status === TechnicalReviewStatus.UNFEASIBLE
    );
  };
