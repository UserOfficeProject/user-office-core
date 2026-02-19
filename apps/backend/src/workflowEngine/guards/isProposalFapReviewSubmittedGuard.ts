import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { ReviewStatus } from '../../models/Review';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalFapReviewSubmittedGuard: GuardFn = async (
  entity: Entity
) => {
  const reviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );

  const reviews = await reviewDataSource.getProposalReviews(entity.id);

  if (reviews.length === 0) {
    return false;
  }

  return reviews.some((review) => review.status === ReviewStatus.SUBMITTED);
};
