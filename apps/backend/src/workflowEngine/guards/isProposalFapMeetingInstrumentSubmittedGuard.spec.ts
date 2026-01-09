import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalFapMeetingInstrumentSubmittedGuard } from './isProposalFapMeetingInstrumentSubmittedGuard';

describe('isProposalFapMeetingInstrumentSubmittedGuard', () => {
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

  it('returns false if no FAPS found for proposal', async () => {
    mockFapDataSource.getFapsByProposalPks.mockResolvedValue([]);
    const result = await isProposalFapMeetingInstrumentSubmittedGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });

  it('returns false if no FAP meeting instrument is submitted', async () => {
    mockFapDataSource.getFapsByProposalPks.mockResolvedValue([
      { fapInstrumentMeetingSubmitted: false },
      { fapInstrumentMeetingSubmitted: false },
    ]);
    const result = await isProposalFapMeetingInstrumentSubmittedGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });

  it('returns true if at least one FAP meeting instrument is submitted', async () => {
    mockFapDataSource.getFapsByProposalPks.mockResolvedValue([
      { fapInstrumentMeetingSubmitted: false },
      { fapInstrumentMeetingSubmitted: true },
    ]);
    const result = await isProposalFapMeetingInstrumentSubmittedGuard({
      id: 1,
    });
    expect(result).toBe(true);
  });
});
