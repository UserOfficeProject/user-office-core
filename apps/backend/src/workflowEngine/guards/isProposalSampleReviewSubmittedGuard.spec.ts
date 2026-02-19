import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { SampleStatus } from '../../models/Sample';
import { isProposalSampleReviewSubmittedGuard } from './isProposalSampleReviewSubmittedGuard';

describe('isProposalSampleReviewSubmittedGuard', () => {
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
    const result = await isProposalSampleReviewSubmittedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if no sample has submitted safety reviews', async () => {
    mockSampleDataSource.getSamples.mockResolvedValue([
      { safetyStatus: SampleStatus.PENDING_EVALUATION },
    ]);
    const result = await isProposalSampleReviewSubmittedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if at least one sample has submitted safety review', async () => {
    mockSampleDataSource.getSamples.mockResolvedValue([
      { safetyStatus: SampleStatus.PENDING_EVALUATION },
      { safetyStatus: SampleStatus.LOW_RISK },
    ]);
    const result = await isProposalSampleReviewSubmittedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
