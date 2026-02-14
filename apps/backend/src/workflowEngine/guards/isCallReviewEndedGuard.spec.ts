import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isCallReviewEndedGuard } from './isCallReviewEndedGuard';

describe('isCallReviewEndedGuard', () => {
  const mockProposalDataSource = {
    get: jest.fn(),
  };
  const mockCallDataSource = {
    getCall: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.ProposalDataSource) return mockProposalDataSource;
      if (token === Tokens.CallDataSource) return mockCallDataSource;

      return null;
    }) as any;
  });

  it('returns false if proposal is not found', async () => {
    mockProposalDataSource.get.mockResolvedValue(null);
    const result = await isCallReviewEndedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if call is not found', async () => {
    mockProposalDataSource.get.mockResolvedValue({ callId: 100 });
    mockCallDataSource.getCall.mockResolvedValue(null);

    const result = await isCallReviewEndedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if call review ended is true', async () => {
    mockProposalDataSource.get.mockResolvedValue({ callId: 100 });
    mockCallDataSource.getCall.mockResolvedValue({ callReviewEnded: true });

    const result = await isCallReviewEndedGuard({ id: 1 });
    expect(result).toBe(true);
  });

  it('returns false if call review ended is false', async () => {
    mockProposalDataSource.get.mockResolvedValue({ callId: 100 });
    mockCallDataSource.getCall.mockResolvedValue({ callReviewEnded: false });

    const result = await isCallReviewEndedGuard({ id: 1 });
    expect(result).toBe(false);
  });
});
