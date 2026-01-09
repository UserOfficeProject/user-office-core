import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { SampleStatus } from '../../models/Sample';
import { isProposalSampleSafeGuard } from './isProposalSampleSafeGuard';

describe('isProposalSampleSafeGuard', () => {
  const mockSampleDataSource = {
    getSamples: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.SampleDataSource) return mockSampleDataSource;

      return null;
    }) as any;
  });

  it('returns false if no samples found', async () => {
    mockSampleDataSource.getSamples.mockResolvedValue([]);
    const result = await isProposalSampleSafeGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if no sample is LOW_RISK', async () => {
    mockSampleDataSource.getSamples.mockResolvedValue([
      { safetyStatus: SampleStatus.HIGH_RISK },
    ]);
    const result = await isProposalSampleSafeGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if at least one sample is LOW_RISK', async () => {
    mockSampleDataSource.getSamples.mockResolvedValue([
      { safetyStatus: SampleStatus.HIGH_RISK },
      { safetyStatus: SampleStatus.LOW_RISK },
    ]);
    const result = await isProposalSampleSafeGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
