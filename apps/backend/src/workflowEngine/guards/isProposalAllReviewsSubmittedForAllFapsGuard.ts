import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { ReviewStatus } from '../../models/Review';
import { Entity, GuardFn } from '../simpleStateMachine/stateMachnine';

export const isProposalAllReviewsSubmittedForAllFapsGuard: GuardFn = async (
  entity: Entity
) => {
  const fapDataSource = container.resolve<FapDataSource>(Tokens.FapDataSource);
  const reviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );

  const faps = await fapDataSource.getFapsByProposalPk(entity.id);
  const reviews = await reviewDataSource.getProposalReviews(entity.id);

  if (faps.length === 0) {
    return false;
  }

  return faps.every((fap) => {
    const fapReviews = reviews.filter((review) => review.fapID === fap.id);

    const submittedReviews = fapReviews.filter(
      (review) => review.status === ReviewStatus.SUBMITTED
    );

    return submittedReviews.length >= fap.numberRatingsRequired;
  });
};
