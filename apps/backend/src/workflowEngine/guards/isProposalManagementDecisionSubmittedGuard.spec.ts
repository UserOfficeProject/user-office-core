import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalManagementDecisionSubmittedGuard } from './isProposalManagementDecisionSubmittedGuard';

describe('isProposalManagementDecisionSubmittedGuard', () => {
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
    await expect(
      isProposalManagementDecisionSubmittedGuard({ id: 1 })
    ).rejects.toThrow('Proposal with pk 1 not found');
  });

  it('returns false if management decision not submitted', async () => {
    mockProposalDataSource.get.mockResolvedValue({
      managementDecisionSubmitted: false,
    });
    const result = await isProposalManagementDecisionSubmittedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if management decision submitted', async () => {
    mockProposalDataSource.get.mockResolvedValue({
      managementDecisionSubmitted: true,
    });
    const result = await isProposalManagementDecisionSubmittedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
