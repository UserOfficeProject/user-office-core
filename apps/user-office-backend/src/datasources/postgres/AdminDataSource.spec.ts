jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));
jest.mock('node:process', () => ({
  cwd: jest.fn().mockReturnValue('working-directory'),
}));
jest.mock('@user-office-software/duo-logger');
jest.mock('./database', () => ({
  transaction: jest.fn(),
  raw: jest.fn(),
}));

import { promises } from 'fs';

import { logger } from '@user-office-software/duo-logger';

import PostgresAdminDataSource from './AdminDataSource';
import database from './database';

describe('PostgresAdminDataSource', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('applyPatches', () => {
    let mockKnexTransacting: jest.Mock;
    let mockLoggerLogInfo: jest.SpyInstance;
    let mockLogException: jest.SpyInstance;
    let adminDataSource: PostgresAdminDataSource;

    beforeEach(() => {
      mockLoggerLogInfo = jest.spyOn(logger, 'logInfo');
      mockLogException = jest.spyOn(logger, 'logException');
      (promises.readdir as jest.Mock).mockResolvedValue([
        'patch1.sql',
        'patch2.sql',
      ]);
      (promises.readFile as jest.Mock).mockImplementation((path) =>
        Promise.resolve(`${path} query`)
      );

      mockKnexTransacting = jest.fn().mockResolvedValue(undefined);
      (database.raw as jest.Mock).mockReturnValue({
        transacting: mockKnexTransacting,
      });
      (database.transaction as jest.Mock).mockImplementation((callback) =>
        callback('current transaction')
      );

      adminDataSource = new PostgresAdminDataSource();
    });

    it('should apply patches correctly', async () => {
      await adminDataSource.applyPatches();

      expect(promises.readdir).toHaveBeenCalledWith(
        'working-directory/db_patches'
      );
      expect(promises.readFile).toHaveBeenNthCalledWith(
        1,
        'working-directory/db_patches/patch1.sql',
        'utf8'
      );
      expect(promises.readFile).toHaveBeenNthCalledWith(
        2,
        'working-directory/db_patches/patch2.sql',
        'utf8'
      );
      expect(database.raw).toHaveBeenCalledTimes(2);
      expect(database.raw).toHaveBeenNthCalledWith(
        1,
        'working-directory/db_patches/patch1.sql query'
      );
      expect(database.raw).toHaveBeenNthCalledWith(
        2,
        'working-directory/db_patches/patch2.sql query'
      );
      expect(mockKnexTransacting).toHaveBeenCalledTimes(2);
      expect(mockKnexTransacting).toHaveBeenNthCalledWith(
        1,
        'current transaction'
      );
      expect(mockKnexTransacting).toHaveBeenNthCalledWith(
        2,
        'current transaction'
      );
      expect(mockLoggerLogInfo).toHaveBeenCalledTimes(2);
      expect(mockLoggerLogInfo).toHaveBeenNthCalledWith(
        1,
        'Applying patches started',
        { timestamp: new Date('2020-01-01') }
      );
      expect(mockLoggerLogInfo).toHaveBeenNthCalledWith(
        2,
        'Applying patches finished',
        { timestamp: new Date('2020-01-01') }
      );
    });

    it('should throw error when transaction fails', async () => {
      mockKnexTransacting.mockRejectedValueOnce('transaction error');

      const res = await adminDataSource
        .applyPatches()
        .then(() => {
          throw Error('should not resolve');
        })
        .catch((error) => error);

      expect(res).toEqual('transaction error');
      expect(mockLogException).toHaveBeenCalledWith(
        'Failed to apply patch',
        'transaction error',
        { file: 'patch1.sql' }
      );
    });
  });
});
