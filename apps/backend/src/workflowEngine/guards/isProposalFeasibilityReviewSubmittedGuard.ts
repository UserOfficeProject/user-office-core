import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalFeasibilityReviewSubmittedGuard: GuardFn = async (
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

  return technicalReviews.some((technicalReview) => technicalReview.submitted);
};
