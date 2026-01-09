import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ExperimentStatus } from '../../models/Experiment';
import { isProposalBookingTimeActivatedGuard } from './isProposalBookingTimeActivatedGuard';

describe('isProposalBookingTimeActivatedGuard', () => {
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
    const result = await isProposalBookingTimeActivatedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns false if no experiment is ACTIVE', async () => {
    mockExperimentDataSource.getExperimentsByProposalPk.mockResolvedValue([
      { status: ExperimentStatus.COMPLETED },
      { status: ExperimentStatus.DRAFT },
    ]);
    const result = await isProposalBookingTimeActivatedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if at least one experiment is ACTIVE', async () => {
    mockExperimentDataSource.getExperimentsByProposalPk.mockResolvedValue([
      { status: ExperimentStatus.COMPLETED },
      { status: ExperimentStatus.ACTIVE },
    ]);
    const result = await isProposalBookingTimeActivatedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
