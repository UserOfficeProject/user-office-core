import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalFapsSelectedGuard } from './isProposalFapsSelectedGuard';

describe('isProposalFapsSelectedGuard', () => {
  const mockFapDataSource = {
    getFapsByProposalPk: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.FapDataSource) return mockFapDataSource;

      return null;
    }) as any;
  });

  it('returns false if no FAPS found for proposal', async () => {
    mockFapDataSource.getFapsByProposalPk.mockResolvedValue([]);
    const result = await isProposalFapsSelectedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if FAPS are found for proposal', async () => {
    mockFapDataSource.getFapsByProposalPk.mockResolvedValue([{ id: 1 }]);
    const result = await isProposalFapsSelectedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
