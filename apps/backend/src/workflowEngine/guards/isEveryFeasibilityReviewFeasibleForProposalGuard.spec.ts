import 'reflect-metadata';
import { container } from 'tsyringe';

import { isEveryFeasibilityReviewFeasibleForProposalGuard } from './isEveryFeasibilityReviewFeasibleForProposalGuard';
import { Tokens } from '../../config/Tokens';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';

describe('isEveryFeasibilityReviewFeasibleForProposalGuard', () => {
  const mockReviewDataSource = {
    getTechnicalReviews: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.ReviewDataSource) return mockReviewDataSource;

      return null;
    }) as typeof container.resolve;
  });

  it('returns false if no technical reviews found', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([]);
    const result = await isEveryFeasibilityReviewFeasibleForProposalGuard({
      id: 1,
    });
    expect(result).toBe(false);

    mockReviewDataSource.getTechnicalReviews.mockResolvedValue(null);
    const resultNull = await isEveryFeasibilityReviewFeasibleForProposalGuard({
      id: 1,
    });
    expect(resultNull).toBe(false);
  });

  it('returns true if all technical reviews are feasible', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { status: TechnicalReviewStatus.FEASIBLE },
      { status: TechnicalReviewStatus.FEASIBLE },
    ]);

    const result = await isEveryFeasibilityReviewFeasibleForProposalGuard({
      id: 1,
    });
    expect(result).toBe(true);
  });

  it('returns false if any technical review is not feasible', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { status: TechnicalReviewStatus.FEASIBLE },
      { status: TechnicalReviewStatus.UNFEASIBLE },
    ]);

    const result = await isEveryFeasibilityReviewFeasibleForProposalGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });
});
