import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewStatus } from '../../models/Review';
import { isProposalAllReviewsSubmittedGuard } from './isProposalAllReviewsSubmittedGuard';

describe('isProposalAllReviewsSubmittedGuard', () => {
  const mockReviewDataSource = {
    getProposalReviews: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.ReviewDataSource) return mockReviewDataSource;

      return null;
    }) as any;
  });

  it('returns false if no reviews are found', async () => {
    mockReviewDataSource.getProposalReviews.mockResolvedValue([]);
    const result = await isProposalAllReviewsSubmittedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if all reviews are submitted', async () => {
    mockReviewDataSource.getProposalReviews.mockResolvedValue([
      { status: ReviewStatus.SUBMITTED },
      { status: ReviewStatus.SUBMITTED },
    ]);

    const result = await isProposalAllReviewsSubmittedGuard({ id: 1 });
    expect(result).toBe(true);
  });

  it('returns false if any review is not submitted', async () => {
    mockReviewDataSource.getProposalReviews.mockResolvedValue([
      { status: ReviewStatus.SUBMITTED },
      { status: ReviewStatus.DRAFT },
    ]);

    const result = await isProposalAllReviewsSubmittedGuard({ id: 1 });
    expect(result).toBe(false);
  });
});
