import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { ReviewStatus } from '../../models/Review';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalAllFapReviewsSubmittedGuard: GuardFn = async (
  entity: Entity
) => {
  const reviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );

  const reviews = await reviewDataSource.getProposalReviews(entity.id);

  if (reviews.length === 0) {
    return false;
  }

  return reviews.every((review) => review.status === ReviewStatus.SUBMITTED);
};
