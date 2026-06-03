import 'reflect-metadata';
import { container } from 'tsyringe';

import { isExperimentESFApprovedByIS } from './isExperimentESFApprovedByIS';
import { Tokens } from '../../config/Tokens';
import { InstrumentScientistDecisionEnum } from '../../models/Experiment';

describe('isExperimentESFApprovedByIS', () => {
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
    const result = await isExperimentESFApprovedByIS({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if instrumentScientistDecision is not ACCEPTED', async () => {
    mockExperimentDataSource.getExperimentSafety.mockResolvedValue({
      instrumentScientistDecision: InstrumentScientistDecisionEnum.REJECTED,
    });
    const result = await isExperimentESFApprovedByIS({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if instrumentScientistDecision is ACCEPTED', async () => {
    mockExperimentDataSource.getExperimentSafety.mockResolvedValue({
      instrumentScientistDecision: InstrumentScientistDecisionEnum.ACCEPTED,
    });
    const result = await isExperimentESFApprovedByIS({ id: 1 });
    expect(result).toBe(true);
  });
});
