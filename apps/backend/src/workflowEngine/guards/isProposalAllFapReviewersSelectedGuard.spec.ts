import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalAllFapReviewersSelectedGuard } from './isProposalAllFapReviewersSelectedGuard';

describe('isProposalAllFapReviewersSelectedGuard', () => {
  const mockFapDataSource = {
    getFapsByProposalPk: jest.fn(),
    getAllFapProposalAssignments: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.FapDataSource) return mockFapDataSource;

      return null;
    }) as any;
  });

  it('returns false if no faps found for proposal', async () => {
    mockFapDataSource.getFapsByProposalPk.mockResolvedValue([]);
    mockFapDataSource.getAllFapProposalAssignments.mockResolvedValue([]);

    const result = await isProposalAllFapReviewersSelectedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if reviews selected meet requirements', async () => {
    mockFapDataSource.getFapsByProposalPk.mockResolvedValue([
      { id: 1, numberRatingsRequired: 2 },
    ]);
    mockFapDataSource.getAllFapProposalAssignments.mockResolvedValue([
      { fapId: 1 },
      { fapId: 1 },
    ]);

    const result = await isProposalAllFapReviewersSelectedGuard({ id: 1 });
    expect(result).toBe(true);
  });

  it('returns false if reviews selected do not meet requirements', async () => {
    mockFapDataSource.getFapsByProposalPk.mockResolvedValue([
      { id: 1, numberRatingsRequired: 2 },
    ]);
    mockFapDataSource.getAllFapProposalAssignments.mockResolvedValue([
      { fapId: 1 },
    ]);

    const result = await isProposalAllFapReviewersSelectedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('handles multiple faps correctly', async () => {
    mockFapDataSource.getFapsByProposalPk.mockResolvedValue([
      { id: 1, numberRatingsRequired: 1 },
      { id: 2, numberRatingsRequired: 1 },
    ]);
    // Only fap 1 has assignments
    mockFapDataSource.getAllFapProposalAssignments.mockResolvedValue([
      { fapId: 1 },
    ]);

    const result = await isProposalAllFapReviewersSelectedGuard({ id: 1 });
    expect(result).toBe(false);

    // Both have assignments
    mockFapDataSource.getAllFapProposalAssignments.mockResolvedValue([
      { fapId: 1 },
      { fapId: 2 },
    ]);
    const result2 = await isProposalAllFapReviewersSelectedGuard({ id: 1 });
    expect(result2).toBe(true);
  });
});
