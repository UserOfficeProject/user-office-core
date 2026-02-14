import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalSubmittedGuard } from './isProposalSubmittedGuard';

describe('isProposalSubmittedGuard', () => {
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
    await expect(isProposalSubmittedGuard({ id: 1 })).rejects.toThrow(
      'Proposal with pk 1 not found'
    );
  });

  it('returns false if proposal not submitted', async () => {
    mockProposalDataSource.get.mockResolvedValue({ submitted: false });
    const result = await isProposalSubmittedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if proposal submitted', async () => {
    mockProposalDataSource.get.mockResolvedValue({ submitted: true });
    const result = await isProposalSubmittedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
