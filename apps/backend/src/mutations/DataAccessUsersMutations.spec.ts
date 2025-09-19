import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { DataAccessUsersDataSource } from '../datasources/DataAccessUsersDataSource';
import { dummyProposalSubmitted } from '../datasources/mockups/ProposalDataSource';
import {
  basicDummyUserNotOnProposal,
  dummyPrincipalInvestigatorWithRole,
  dummyUser,
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
      const dataAccessUserIds = [basicDummyUserNotOnProposal.id];
      const expectedDataAccessUsers = [basicDummyUserNotOnProposal];

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
      jest.spyOn(mockDataSource, 'updateDataAccessUsers');

      const result = await dataAccessUsersMutations.updateDataAccessUsers(
        dummyUserNotOnProposalWithRole,
        {
          proposalPk: dummyProposalSubmitted.primaryKey,
          userIds: [basicDummyUserNotOnProposal.id],
        }
      );

      expect(mockDataSource.updateDataAccessUsers).toHaveBeenCalledTimes(0);
      expect(result).toBeInstanceOf(Rejection);
    });

    it('Should handle data source errors', async () => {
      const updateSpy = jest.spyOn(mockDataSource, 'updateDataAccessUsers');
      updateSpy.mockRejectedValue(new Error('Database error'));

      const result = await dataAccessUsersMutations.updateDataAccessUsers(
        dummyPrincipalInvestigatorWithRole,
        { proposalPk: dummyProposalSubmitted.primaryKey, userIds: [] }
      );

      expect(result).toBeInstanceOf(Rejection);
      expect((result as Rejection).reason).toBe(
        'Failed to update data access users'
      );
    });

    it('Should not be able to add data access users if already a member of the proposal', async () => {
      const userOnProposal = dummyUser;

      const result = await dataAccessUsersMutations.updateDataAccessUsers(
        dummyPrincipalInvestigatorWithRole,
        {
          proposalPk: dummyProposalSubmitted.primaryKey,
          userIds: [userOnProposal.id],
        }
      );

      expect(result).toBeInstanceOf(Rejection);
      expect((result as Rejection).reason).toBe(
        'User can not be symultaneously a data access user and a member of the proposal'
      );
    });
  });
});
