import 'reflect-metadata';
import { container } from 'tsyringe';

import { isEveryFeasibilityReviewUnFeasibleForProposalGuard } from './isEveryFeasibilityReviewUnFeasibleForProposalGuard';
import { Tokens } from '../../config/Tokens';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';

describe('isEveryFeasibilityReviewUnFeasibleForProposalGuard', () => {
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
    const result = await isEveryFeasibilityReviewUnFeasibleForProposalGuard({
      id: 1,
    });
    expect(result).toBe(false);

    mockReviewDataSource.getTechnicalReviews.mockResolvedValue(null);
    const resultNull = await isEveryFeasibilityReviewUnFeasibleForProposalGuard(
      {
        id: 1,
      }
    );
    expect(resultNull).toBe(false);
  });

  it('returns true if all technical reviews are unfeasible', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { status: TechnicalReviewStatus.UNFEASIBLE },
      { status: TechnicalReviewStatus.UNFEASIBLE },
    ]);

    const result = await isEveryFeasibilityReviewUnFeasibleForProposalGuard({
      id: 1,
    });
    expect(result).toBe(true);
  });

  it('returns false if any technical review is sfeasible', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { status: TechnicalReviewStatus.FEASIBLE },
      { status: TechnicalReviewStatus.UNFEASIBLE },
    ]);

    const result = await isEveryFeasibilityReviewUnFeasibleForProposalGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });
});
