import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { DataAccessUsersDataSource } from '../datasources/DataAccessUsersDataSource';
import {
  dummyDataAccessUser,
  dummyDataAccessUser2,
} from '../datasources/mockups/DataAccessUsersDataSource';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import { Rejection } from '../models/Rejection';
import DataAccessUsersMutations from './DataAccessUsersMutations';

const dataAccessUsersMutations = container.resolve(DataAccessUsersMutations);

let mockDataSource: DataAccessUsersDataSource;

beforeEach(() => {
  mockDataSource = container.resolve<DataAccessUsersDataSource>(
    Tokens.DataAccessUsersDataSource
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('DataAccessUsersMutations', () => {
  describe('updateDataAccessUsers', () => {
    it('should update data access users successfully', async () => {
      const proposalPk = 1;
      const userIds = [100, 101];
      const expectedUsers = [dummyDataAccessUser, dummyDataAccessUser2];

      const updateSpy = jest.spyOn(mockDataSource, 'updateDataAccessUsers');
      updateSpy.mockResolvedValue(expectedUsers);

      const result = await dataAccessUsersMutations.updateDataAccessUsers(
        dummyUserWithRole,
        { proposalPk, userIds }
      );

      expect(mockDataSource.updateDataAccessUsers).toHaveBeenCalledWith(
        proposalPk,
        userIds
      );
      expect(result).toEqual(expectedUsers);
    });

    it('should handle data source errors', async () => {
      const proposalPk = 1;
      const userIds = [100];
      const error = new Error('Database error');

      const updateSpy = jest.spyOn(mockDataSource, 'updateDataAccessUsers');
      updateSpy.mockRejectedValue(error);

      const result = await dataAccessUsersMutations.updateDataAccessUsers(
        dummyUserWithRole,
        { proposalPk, userIds }
      );

      expect(result).toBeInstanceOf(Rejection);
      expect((result as Rejection).reason).toBe(
        'Failed to update data access users'
      );
    });
  });
});
