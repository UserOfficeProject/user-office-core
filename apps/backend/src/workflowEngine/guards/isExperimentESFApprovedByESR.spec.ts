import 'reflect-metadata';
import { container } from 'tsyringe';

import { isExperimentESFApprovedByESR } from './isExperimentESFApprovedByESR';
import { Tokens } from '../../config/Tokens';
import { ExperimentSafetyReviewerDecisionEnum } from '../../models/Experiment';

describe('isExperimentESFApprovedByESR', () => {
  const mockExperimentDataSource = {
    getExperimentSafety: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.ExperimentDataSource)
        return mockExperimentDataSource;

      return null;
    }) as any;
  });

  it('returns false if experiment safety not found', async () => {
    mockExperimentDataSource.getExperimentSafety.mockResolvedValue(null);
    const result = await isExperimentESFApprovedByESR({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if experimentSafetyReviewerDecision is not ACCEPTED', async () => {
    mockExperimentDataSource.getExperimentSafety.mockResolvedValue({
      experimentSafetyReviewerDecision:
        ExperimentSafetyReviewerDecisionEnum.REJECTED,
    });
    const result = await isExperimentESFApprovedByESR({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if experimentSafetyReviewerDecision is ACCEPTED', async () => {
    mockExperimentDataSource.getExperimentSafety.mockResolvedValue({
      experimentSafetyReviewerDecision:
        ExperimentSafetyReviewerDecisionEnum.ACCEPTED,
    });
    const result = await isExperimentESFApprovedByESR({ id: 1 });
    expect(result).toBe(true);
  });
});
