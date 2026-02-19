import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { isProposalFeasibilityReviewFeasibleGuard } from './isProposalFeasibilityReviewFeasibleGuard';

describe('isProposalFeasibilityReviewFeasibleGuard', () => {
  const mockReviewDataSource = {
    getTechnicalReviews: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.ReviewDataSource) return mockReviewDataSource;

      return null;
    }) as any;
  });

  it('returns false if no technical reviews found for proposal', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([]);
    const result = await isProposalFeasibilityReviewFeasibleGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if no technical review is FEASIBLE', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { status: TechnicalReviewStatus.UNFEASIBLE },
    ]);
    const result = await isProposalFeasibilityReviewFeasibleGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if at least one technical review is FEASIBLE', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { status: TechnicalReviewStatus.UNFEASIBLE },
      { status: TechnicalReviewStatus.FEASIBLE },
    ]);
    const result = await isProposalFeasibilityReviewFeasibleGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
