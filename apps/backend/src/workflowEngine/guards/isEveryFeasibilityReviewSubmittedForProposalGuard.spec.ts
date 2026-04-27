import 'reflect-metadata';
import { container } from 'tsyringe';

import { isEveryFeasibilityReviewSubmittedForProposalGuard } from './isEveryFeasibilityReviewSubmittedForProposalGuard';
import { Tokens } from '../../config/Tokens';

describe('isEveryFeasibilityReviewSubmittedForProposalGuard', () => {
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
    const result = await isEveryFeasibilityReviewSubmittedForProposalGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });

  it('returns true if all technical reviews are submitted', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { submitted: true },
      { submitted: true },
    ]);

    const result = await isEveryFeasibilityReviewSubmittedForProposalGuard({
      id: 1,
    });
    expect(result).toBe(true);
  });

  it('returns false if any technical review is not submitted', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { submitted: true },
      { submitted: false },
    ]);

    const result = await isEveryFeasibilityReviewSubmittedForProposalGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });
});
