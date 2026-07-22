import 'reflect-metadata';
import { container } from 'tsyringe';

import { isExperimentESFSubmitted } from './isExperimentESFSubmitted';
import { Tokens } from '../../config/Tokens';

describe('isExperimentESFSubmitted', () => {
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
    const result = await isExperimentESFSubmitted({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if esiQuestionarySubmittedAt is not set', async () => {
    mockExperimentDataSource.getExperimentSafety.mockResolvedValue({
      esiQuestionarySubmittedAt: null,
    });
    const result = await isExperimentESFSubmitted({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if esiQuestionarySubmittedAt is set', async () => {
    mockExperimentDataSource.getExperimentSafety.mockResolvedValue({
      esiQuestionarySubmittedAt: new Date('2024-01-01'),
    });
    const result = await isExperimentESFSubmitted({ id: 1 });
    expect(result).toBe(true);
  });
});
