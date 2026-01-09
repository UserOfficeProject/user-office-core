import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalNotifiedGuard } from './isProposalNotifiedGuard';

describe('isProposalNotifiedGuard', () => {
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
    await expect(isProposalNotifiedGuard({ id: 1 })).rejects.toThrow(
      'Proposal with pk 1 not found'
    );
  });

  it('returns false if proposal not notified', async () => {
    mockProposalDataSource.get.mockResolvedValue({ notified: false });
    const result = await isProposalNotifiedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if proposal notified', async () => {
    mockProposalDataSource.get.mockResolvedValue({ notified: true });
    const result = await isProposalNotifiedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
