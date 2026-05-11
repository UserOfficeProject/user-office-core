import { logger } from '@user-office-software/duo-logger';

import { getInstitutionFromRor } from './RorApi';

jest.mock('@user-office-software/duo-logger', () => ({
  logger: {
    logError: jest.fn(),
  },
}));

describe('RorApi', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should return institution name and country for valid ROR ID', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      clone: jest.fn().mockReturnThis(),
      json: async () => ({
        names: [{ types: ['ror_display'], value: 'Test Institution' }],
        locations: [{ geonames_details: { country_name: 'Test Country' } }],
      }),
    });

    const result = await getInstitutionFromRor('05n09v162');

    expect(result).toEqual({
      name: 'Test Institution',
      country: 'Test Country',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.ror.org/organizations/05n09v162'
    );
  });

  it('should handle full URL ROR ID by extracting the ID', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      clone: jest.fn().mockReturnThis(),
      json: async () => ({
        names: [{ types: ['ror_display'], value: 'Test Institution' }],
        locations: [{ geonames_details: { country_name: 'Test Country' } }],
      }),
    });

    const result = await getInstitutionFromRor('https://ror.org/05n09v162');

    expect(result).toEqual({
      name: 'Test Institution',
      country: 'Test Country',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.ror.org/organizations/05n09v162'
    );
  });

  it('should return null if institution not found (404)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      clone: jest.fn().mockReturnThis(),
      json: async () => ({}),
    });

    const result = await getInstitutionFromRor('invalid-id');

    expect(result).toBeNull();
    expect(logger.logError).toHaveBeenCalledWith(
      'Institution not found in ROR',
      { rorId: 'invalid-id' }
    );
  });

  it('should return null if fetch fails with non-ok status', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      clone: jest.fn().mockReturnThis(),
      json: async () => ({}),
    });

    const result = await getInstitutionFromRor('05n09v162');

    expect(result).toBeNull();
    expect(logger.logError).toHaveBeenCalledWith(
      'Failed to fetch institution from ROR',
      {
        rorId: '05n09v162',
        status: 500,
      }
    );
  });

  it('should return null if name missing in response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      clone: jest.fn().mockReturnThis(),
      json: async () => ({
        names: [{ types: ['other'], value: 'Some Name' }], // Missing ror_display type
        locations: [{ geonames_details: { country_name: 'Test Country' } }],
      }),
    });

    const result = await getInstitutionFromRor('05n09v162');

    expect(result).toBeNull();
    expect(logger.logError).toHaveBeenCalledWith(
      'ROR response missing name or country',
      expect.anything()
    );
  });

  it('should return null if country missing in response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      clone: jest.fn().mockReturnThis(),
      json: async () => ({
        names: [{ types: ['ror_display'], value: 'Test Institution' }],
        locations: [], // Missing location
      }),
    });

    const result = await getInstitutionFromRor('05n09v162');

    expect(result).toBeNull();
    expect(logger.logError).toHaveBeenCalledWith(
      'ROR response missing name or country',
      expect.anything()
    );
  });

  it('should return null on fetch exception', async () => {
    const error = new Error('Network error');
    (global.fetch as jest.Mock).mockRejectedValue(error);

    const result = await getInstitutionFromRor('05n09v162');

    expect(result).toBeNull();
    expect(logger.logError).toHaveBeenCalledWith(
      'Error fetching institution from ROR',
      { rorId: '05n09v162', error }
    );
  });
});
