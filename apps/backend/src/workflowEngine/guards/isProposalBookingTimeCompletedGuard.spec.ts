import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ExperimentStatus } from '../../models/Experiment';
import { isProposalBookingTimeCompletedGuard } from './isProposalBookingTimeCompletedGuard';

describe('isProposalBookingTimeCompletedGuard', () => {
  const mockExperimentDataSource = {
    getExperimentsByProposalPk: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.ExperimentDataSource)
        return mockExperimentDataSource;

      return null;
    }) as any;
  });

  it('returns false if no experiments found for proposal', async () => {
    mockExperimentDataSource.getExperimentsByProposalPk.mockResolvedValue([]);
    const result = await isProposalBookingTimeCompletedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if any experiment is NOT COMPLETED', async () => {
    mockExperimentDataSource.getExperimentsByProposalPk.mockResolvedValue([
      { status: ExperimentStatus.COMPLETED },
      { status: ExperimentStatus.ACTIVE },
    ]);
    const result = await isProposalBookingTimeCompletedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if all experiments are COMPLETED', async () => {
    mockExperimentDataSource.getExperimentsByProposalPk.mockResolvedValue([
      { status: ExperimentStatus.COMPLETED },
      { status: ExperimentStatus.COMPLETED },
    ]);
    const result = await isProposalBookingTimeCompletedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
