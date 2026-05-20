import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { Entity, GuardFn } from '../stateMachine/stateMachnine';

/**
 * Returns true when every feasibility review for the proposal is marked feasible.
 */
export const isEveryFeasibilityReviewFeasibleForProposalGuard: GuardFn = async (
  entity: Entity
) => {
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
      technicalReview.status === TechnicalReviewStatus.FEASIBLE
  );
};
