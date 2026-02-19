import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalEndStatus } from '../../models/Proposal';
import { isProposalReservedGuard } from './isProposalReservedGuard';

describe('isProposalReservedGuard', () => {
  const mockProposalDataSource = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.ProposalDataSource) return mockProposalDataSource;

      return null;
    }) as any;
  });

  it('throws error if proposal not found', async () => {
    mockProposalDataSource.get.mockResolvedValue(null);
    await expect(isProposalReservedGuard({ id: 1 })).rejects.toThrow(
      'Proposal with pk 1 not found'
    );
  });

  it('returns false if proposal not RESERVED', async () => {
    mockProposalDataSource.get.mockResolvedValue({
      finalStatus: ProposalEndStatus.ACCEPTED,
    });
    const result = await isProposalReservedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if proposal RESERVED', async () => {
    mockProposalDataSource.get.mockResolvedValue({
      finalStatus: ProposalEndStatus.RESERVED,
    });
    const result = await isProposalReservedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
