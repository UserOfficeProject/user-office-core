import { container } from 'tsyringe';

import { DataAccessUsersAuthorization } from './DataAccessUsersAuthorization';
import {
  dummyPrincipalInvestigatorWithRole,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';

const dataAccessUsersAuth = container.resolve(DataAccessUsersAuthorization);

describe('DataAccessUsersAuthorization', () => {
  describe('hasWriteRights', () => {
    test('A user officer has write rights to manage data access users for any proposal', async () => {
      return expect(
        dataAccessUsersAuth.hasWriteRights(dummyUserOfficerWithRole, 1)
      ).resolves.toEqual(true);
    });

    test('A principal investigator has write rights to manage data access users for their proposal', async () => {
      return expect(
        dataAccessUsersAuth.hasWriteRights(
          dummyPrincipalInvestigatorWithRole,
          1
        )
      ).resolves.toEqual(true);
    });

    test('Co Proposer Has write rights to manage data access users for their proposal', async () => {
      return expect(
        dataAccessUsersAuth.hasWriteRights(dummyUserWithRole, 1)
      ).resolves.toEqual(true);
    });

    test('A user without proposal access does not have write rights to manage data access users', async () => {
      return expect(
        dataAccessUsersAuth.hasWriteRights(dummyUserNotOnProposalWithRole, 1)
      ).resolves.toEqual(false);
    });

    test('A null agent does not have write rights to manage data access users', async () => {
      return expect(
        dataAccessUsersAuth.hasWriteRights(null, 1)
      ).resolves.toEqual(false);
    });

    test('A user does not have rights to manage a non-existent proposal', async () => {
      const nonExistentProposalId = 999;

      return expect(
        dataAccessUsersAuth.hasWriteRights(
          dummyUserOfficerWithRole,
          nonExistentProposalId
        )
      ).resolves.toEqual(false);
    });
  });
});
