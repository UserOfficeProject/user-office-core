import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalFeasibilityReviewSubmittedGuard } from './isProposalFeasibilityReviewSubmittedGuard';

describe('isProposalFeasibilityReviewSubmittedGuard', () => {
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
    const result = await isProposalFeasibilityReviewSubmittedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if no technical review is submitted', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { submitted: false },
    ]);
    const result = await isProposalFeasibilityReviewSubmittedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if at least one technical review is submitted', async () => {
    mockReviewDataSource.getTechnicalReviews.mockResolvedValue([
      { submitted: false },
      { submitted: true },
    ]);
    const result = await isProposalFeasibilityReviewSubmittedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
