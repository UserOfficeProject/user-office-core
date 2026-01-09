import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalAssignedToTechniquesGuard } from './isProposalAssignedToTechniquesGuard';

describe('isProposalAssignedToTechniquesGuard', () => {
  const mockTechniqueDataSource = {
    getTechniquesByProposalPk: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.TechniqueDataSource) return mockTechniqueDataSource;

      return null;
    }) as any;
  });

  it('returns false if no techniques found for proposal', async () => {
    mockTechniqueDataSource.getTechniquesByProposalPk.mockResolvedValue([]);
    const result = await isProposalAssignedToTechniquesGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if techniques found for proposal', async () => {
    mockTechniqueDataSource.getTechniquesByProposalPk.mockResolvedValue([
      { id: 1 },
    ]);
    const result = await isProposalAssignedToTechniquesGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
