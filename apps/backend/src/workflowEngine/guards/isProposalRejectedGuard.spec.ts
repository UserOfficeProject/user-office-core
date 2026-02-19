import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalEndStatus } from '../../models/Proposal';
import { isProposalRejectedGuard } from './isProposalRejectedGuard';

describe('isProposalRejectedGuard', () => {
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
    await expect(isProposalRejectedGuard({ id: 1 })).rejects.toThrow(
      'Proposal with pk 1 not found'
    );
  });

  it('returns false if proposal not REJECTED', async () => {
    mockProposalDataSource.get.mockResolvedValue({
      finalStatus: ProposalEndStatus.ACCEPTED,
    });
    const result = await isProposalRejectedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if proposal REJECTED', async () => {
    mockProposalDataSource.get.mockResolvedValue({
      finalStatus: ProposalEndStatus.REJECTED,
    });
    const result = await isProposalRejectedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
