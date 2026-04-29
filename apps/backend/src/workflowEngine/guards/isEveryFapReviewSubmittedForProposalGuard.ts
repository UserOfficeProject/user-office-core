import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { ReviewStatus } from '../../models/Review';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachine';

/**
 * Returns true when every FAP review on the proposal has been submitted.
 */
export const isEveryFapReviewSubmittedForProposalGuard: GuardFn = async (
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
