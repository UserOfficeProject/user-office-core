import 'reflect-metadata';
import { container } from 'tsyringe';

import { isProposalFeasibilityReviewUnfeasibleGuard } from './isProposalFeasibilityReviewUnfeasibleGuard';
import { Tokens } from '../../config/Tokens';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';

describe('isProposalFeasibilityReviewUnfeasibleGuard', () => {
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

  it('returns false if no technical reviews found', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([]);
    const result = await isProposalFeasibilityReviewUnfeasibleGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if no technical review is UNFEASIBLE', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { status: TechnicalReviewStatus.FEASIBLE },
    ]);
    const result = await isProposalFeasibilityReviewUnfeasibleGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if at least one technical review is UNFEASIBLE', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { status: TechnicalReviewStatus.FEASIBLE },
      { status: TechnicalReviewStatus.UNFEASIBLE },
    ]);
    const result = await isProposalFeasibilityReviewUnfeasibleGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
