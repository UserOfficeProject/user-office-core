import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalEndStatus } from '../../models/Proposal';
import { isProposalAcceptedGuard } from './isProposalAcceptedGuard';

describe('isProposalAcceptedGuard', () => {
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

  it('returns false if proposal is not found', async () => {
    mockProposalDataSource.get.mockResolvedValue(null);
    const result = await isProposalAcceptedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if proposal status is ACCEPTED and management decision submitted', async () => {
    mockProposalDataSource.get.mockResolvedValue({
      finalStatus: ProposalEndStatus.ACCEPTED,
      managementDecisionSubmitted: true,
    });

    const result = await isProposalAcceptedGuard({ id: 1 });
    expect(result).toBe(true);
  });

  it('returns false if proposal status is not ACCEPTED', async () => {
    mockProposalDataSource.get.mockResolvedValue({
      finalStatus: ProposalEndStatus.REJECTED,
      managementDecisionSubmitted: true,
    });

    const result = await isProposalAcceptedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if management decision is not submitted', async () => {
    mockProposalDataSource.get.mockResolvedValue({
      finalStatus: ProposalEndStatus.ACCEPTED,
      managementDecisionSubmitted: false,
    });

    const result = await isProposalAcceptedGuard({ id: 1 });
    expect(result).toBe(false);
  });
});
