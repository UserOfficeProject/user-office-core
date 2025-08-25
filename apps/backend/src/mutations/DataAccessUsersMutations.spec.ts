import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { DataAccessUsersDataSource } from '../datasources/DataAccessUsersDataSource';
import { dummyProposalSubmitted } from '../datasources/mockups/ProposalDataSource';
import {
  basicDummyUser,
  dummyPrincipalInvestigatorWithRole,
  dummyUserNotOnProposalWithRole,
} from '../datasources/mockups/UserDataSource';
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
    it('PI should be able to update data access users successfully', async () => {
      const proposalPk = dummyProposalSubmitted.primaryKey;
      const dataAccessUserIds = [basicDummyUser.id];
      const expectedDataAccessUsers = [basicDummyUser];

      jest.spyOn(mockDataSource, 'updateDataAccessUsers');

      const result = await dataAccessUsersMutations.updateDataAccessUsers(
        dummyPrincipalInvestigatorWithRole,
        { proposalPk, userIds: dataAccessUserIds }
      );

      expect(mockDataSource.updateDataAccessUsers).toHaveBeenCalledWith(
        proposalPk,
        dataAccessUserIds
      );

      expect(result).not.toBeInstanceOf(Rejection);
      expect(result).toEqual(expectedDataAccessUsers);
    });

    it('User not on proposal should NOT be able to update data access users', async () => {
      const proposalPk = dummyProposalSubmitted.primaryKey;
      const dataAccessUserIds = [basicDummyUser.id];

      jest.spyOn(mockDataSource, 'updateDataAccessUsers');

      const result = await dataAccessUsersMutations.updateDataAccessUsers(
        dummyUserNotOnProposalWithRole,
        { proposalPk, userIds: dataAccessUserIds }
      );

      expect(mockDataSource.updateDataAccessUsers).toHaveBeenCalledTimes(0);
      expect(result).toBeInstanceOf(Rejection);
    });

    it('Should handle data source errors', async () => {
      const proposalPk = dummyProposalSubmitted.primaryKey;
      const dataAccessUserIds = [basicDummyUser.id];
      const error = new Error('Database error');

      const updateSpy = jest.spyOn(mockDataSource, 'updateDataAccessUsers');
      updateSpy.mockRejectedValue(error);

      const result = await dataAccessUsersMutations.updateDataAccessUsers(
        dummyPrincipalInvestigatorWithRole,
        { proposalPk, userIds: dataAccessUserIds }
      );

      expect(result).toBeInstanceOf(Rejection);
      expect((result as Rejection).reason).toBe(
        'Failed to update data access users'
      );
    });
  });
});
