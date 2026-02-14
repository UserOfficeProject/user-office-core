import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isCallEndedGuard } from './isCallEndedGuard';

describe('isCallEndedGuard', () => {
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
    const result = await isCallEndedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if call is not found', async () => {
    mockProposalDataSource.get.mockResolvedValue({ callId: 100 });
    mockCallDataSource.getCall.mockResolvedValue(null);

    const result = await isCallEndedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if call is ended', async () => {
    mockProposalDataSource.get.mockResolvedValue({ callId: 100 });
    mockCallDataSource.getCall.mockResolvedValue({ callEnded: true });

    const result = await isCallEndedGuard({ id: 1 });
    expect(result).toBe(true);
  });

  it('returns false if call is not ended', async () => {
    mockProposalDataSource.get.mockResolvedValue({ callId: 100 });
    mockCallDataSource.getCall.mockResolvedValue({ callEnded: false });

    const result = await isCallEndedGuard({ id: 1 });
    expect(result).toBe(false);
  });
});
