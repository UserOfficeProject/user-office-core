import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewStatus } from '../../models/Review';
import { isProposalAllReviewsSubmittedForAllFapsGuard } from './isProposalAllReviewsSubmittedForAllFapsGuard';

describe('isProposalAllReviewsSubmittedForAllFapsGuard', () => {
  const mockFapDataSource = {
    getFapsByProposalPk: jest.fn(),
  };
  const mockReviewDataSource = {
    getProposalReviews: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.FapDataSource) return mockFapDataSource;
      if (token === Tokens.ReviewDataSource) return mockReviewDataSource;

      return null;
    }) as any;
  });

  it('returns false if no faps found for proposal', async () => {
    mockFapDataSource.getFapsByProposalPk.mockResolvedValue([]);
    mockReviewDataSource.getProposalReviews.mockResolvedValue([]);

    const result = await isProposalAllReviewsSubmittedForAllFapsGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });

  it('returns true if reviews submitted meet requirements for all faps', async () => {
    mockFapDataSource.getFapsByProposalPk.mockResolvedValue([
      { id: 1, numberRatingsRequired: 2 },
    ]);
    mockReviewDataSource.getProposalReviews.mockResolvedValue([
      { fapID: 1, status: ReviewStatus.SUBMITTED },
      { fapID: 1, status: ReviewStatus.SUBMITTED },
    ]);

    const result = await isProposalAllReviewsSubmittedForAllFapsGuard({
      id: 1,
    });
    expect(result).toBe(true);
  });

  it('returns false if reviews submitted do not meet requirements for any fap', async () => {
    mockFapDataSource.getFapsByProposalPk.mockResolvedValue([
      { id: 1, numberRatingsRequired: 2 },
    ]);
    mockReviewDataSource.getProposalReviews.mockResolvedValue([
      { fapID: 1, status: ReviewStatus.SUBMITTED },
      { fapID: 1, status: ReviewStatus.DRAFT },
    ]);

    const result = await isProposalAllReviewsSubmittedForAllFapsGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });

  it('handles multiple faps correctly', async () => {
    mockFapDataSource.getFapsByProposalPk.mockResolvedValue([
      { id: 1, numberRatingsRequired: 1 },
      { id: 2, numberRatingsRequired: 1 },
    ]);

    // FAP 1 has submitted review, FAP 2 doesn't
    mockReviewDataSource.getProposalReviews.mockResolvedValue([
      { fapID: 1, status: ReviewStatus.SUBMITTED },
    ]);
    const result = await isProposalAllReviewsSubmittedForAllFapsGuard({
      id: 1,
    });
    expect(result).toBe(false);

    // Both have submitted reviews
    mockReviewDataSource.getProposalReviews.mockResolvedValue([
      { fapID: 1, status: ReviewStatus.SUBMITTED },
      { fapID: 2, status: ReviewStatus.SUBMITTED },
    ]);
    const result2 = await isProposalAllReviewsSubmittedForAllFapsGuard({
      id: 1,
    });
    expect(result2).toBe(true);
  });
});
