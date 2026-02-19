import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalFapMeetingInstrumentUnsubmittedGuard } from './isProposalFapMeetingInstrumentUnsubmittedGuard';

describe('isProposalFapMeetingInstrumentUnsubmittedGuard', () => {
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
    const result = await isProposalFapMeetingInstrumentUnsubmittedGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });

  it('returns false if any FAP meeting instrument is submitted', async () => {
    mockFapDataSource.getFapsByProposalPks.mockResolvedValue([
      { fapInstrumentMeetingSubmitted: false },
      { fapInstrumentMeetingSubmitted: true },
    ]);
    const result = await isProposalFapMeetingInstrumentUnsubmittedGuard({
      id: 1,
    });
    expect(result).toBe(false);
  });

  it('returns true if all FAP meeting instruments are unsubmitted', async () => {
    mockFapDataSource.getFapsByProposalPks.mockResolvedValue([
      { fapInstrumentMeetingSubmitted: false },
      { fapInstrumentMeetingSubmitted: false },
    ]);
    const result = await isProposalFapMeetingInstrumentUnsubmittedGuard({
      id: 1,
    });
    expect(result).toBe(true);
  });
});
