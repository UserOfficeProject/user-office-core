import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { isProposalAllFeasibilityReviewsFeasibleGuard } from './isProposalAllFeasibilityReviewsFeasibleGuard';

describe('isProposalAllFeasibilityReviewsFeasibleGuard', () => {
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
    const result = await isProposalAllFeasibilityReviewsFeasibleGuard({
      id: 1,
    });
    expect(result).toBe(false);

    mockReviewDataSource.getTechnicalReviews.mockResolvedValue(null);
    const resultNull = await isProposalAllFeasibilityReviewsFeasibleGuard({
      id: 1,
    });
    expect(resultNull).toBe(false);
  });

  it('returns true if all technical reviews are feasible', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { status: TechnicalReviewStatus.FEASIBLE },
      { status: TechnicalReviewStatus.FEASIBLE },
    ]);

    const result = await isProposalAllFeasibilityReviewsFeasibleGuard({
      id: 1,
    });
    expect(result).toBe(true);
  });

  it('returns false if any technical review is not feasible', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { status: TechnicalReviewStatus.FEASIBLE },
      { status: TechnicalReviewStatus.UNFEASIBLE },
    ]);

    const result = await isProposalAllFeasibilityReviewsFeasibleGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });
});
