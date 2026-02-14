import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalAllFapMeetingInstrumentSubmittedGuard } from './isProposalAllFapMeetingInstrumentSubmittedGuard';

describe('isProposalAllFapMeetingInstrumentSubmittedGuard', () => {
  const mockFapDataSource = {
    getFapsByProposalPks: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.FapDataSource) return mockFapDataSource;

      return null;
    }) as any;
  });

  it('returns false if no fap proposals found', async () => {
    mockFapDataSource.getFapsByProposalPks.mockResolvedValue([]);
    const result = await isProposalAllFapMeetingInstrumentSubmittedGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });

  it('returns true if all fap proposals are submitted', async () => {
    mockFapDataSource.getFapsByProposalPks.mockResolvedValue([
      { fapInstrumentMeetingSubmitted: true },
      { fapInstrumentMeetingSubmitted: true },
    ]);

    const result = await isProposalAllFapMeetingInstrumentSubmittedGuard({
      id: 1,
    });
    expect(result).toBe(true);
  });

  it('returns false if any fap proposal is not submitted', async () => {
    mockFapDataSource.getFapsByProposalPks.mockResolvedValue([
      { fapInstrumentMeetingSubmitted: true },
      { fapInstrumentMeetingSubmitted: false },
    ]);

    const result = await isProposalAllFapMeetingInstrumentSubmittedGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });
});
