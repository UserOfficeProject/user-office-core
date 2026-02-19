import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewStatus } from '../../models/Review';
import { isProposalFapReviewSubmittedGuard } from './isProposalFapReviewSubmittedGuard';

describe('isProposalFapReviewSubmittedGuard', () => {
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

  it('returns false if no reviews found for proposal', async () => {
    mockReviewDataSource.getProposalReviews.mockResolvedValue([]);
    const result = await isProposalFapReviewSubmittedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if no review is SUBMITTED', async () => {
    mockReviewDataSource.getProposalReviews.mockResolvedValue([
      { status: ReviewStatus.DRAFT },
      { status: ReviewStatus.DRAFT },
    ]);
    const result = await isProposalFapReviewSubmittedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if at least one review is SUBMITTED', async () => {
    mockReviewDataSource.getProposalReviews.mockResolvedValue([
      { status: ReviewStatus.DRAFT },
      { status: ReviewStatus.SUBMITTED },
    ]);
    const result = await isProposalFapReviewSubmittedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
