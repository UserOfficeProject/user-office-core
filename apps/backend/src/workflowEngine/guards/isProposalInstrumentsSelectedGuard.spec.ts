import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { isProposalInstrumentsSelectedGuard } from './isProposalInstrumentsSelectedGuard';

describe('isProposalInstrumentsSelectedGuard', () => {
  const mockInstrumentDataSource = {
    getInstrumentsByProposalPk: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    container.resolve = jest.fn((token) => {
      if (token === Tokens.InstrumentDataSource)
        return mockInstrumentDataSource;

      return null;
    }) as any;
  });

  it('returns false if no instruments selected', async () => {
    mockInstrumentDataSource.getInstrumentsByProposalPk.mockResolvedValue([]);
    const result = await isProposalInstrumentsSelectedGuard({ id: 1 });
    expect(result).toBe(false);
  });

  it('returns true if instruments selected', async () => {
    mockInstrumentDataSource.getInstrumentsByProposalPk.mockResolvedValue([
      { id: 1 },
    ]);
    const result = await isProposalInstrumentsSelectedGuard({ id: 1 });
    expect(result).toBe(true);
  });
});
