import 'reflect-metadata';
import { container } from 'tsyringe';

import { VisitAuthorization } from './VisitAuthorization';
import { Tokens } from '../config/Tokens';
import {
  dummyPrincipalInvestigatorWithRole,
  dummySecondVisitorWithRole,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
  dummyVisitorWithRole,
  dummyVisitTeamLeadWithRole,
} from '../datasources/mockups/UserDataSource';
import { VisitDataSourceMock } from '../datasources/mockups/VisitDataSource';

const visitAuth = container.resolve(VisitAuthorization);
const visitDataSource = container.resolve<VisitDataSourceMock>(
  Tokens.VisitDataSource
);

/*
 * Visit 5 sits on proposal 1, whose principal investigator is user 1 and whose
 * only other member is co-proposer user 2. Its team lead and visitors are not
 * members of that proposal, so each authorization path is tested in isolation.
 */
const VISIT_ID = 5;
const NON_EXISTENT_VISIT_ID = 999;
// Proposal that visit 5 sits on; its principal investigator is user 1.
const PROPOSAL_PK = 1;

beforeEach(() => {
  visitDataSource.init();
});

describe('VisitAuthorization', () => {
  describe('hasWriteRights', () => {
    test('A user officer can edit the visitor list', async () => {
      return expect(
        visitAuth.hasWriteRights(dummyUserOfficerWithRole, VISIT_ID)
      ).resolves.toEqual(true);
    });

    test('The principal investigator can edit the visitor list', async () => {
      return expect(
        visitAuth.hasWriteRights(dummyPrincipalInvestigatorWithRole, VISIT_ID)
      ).resolves.toEqual(true);
    });

    test('A co-proposer can not edit the visitor list', async () => {
      return expect(
        visitAuth.hasWriteRights(dummyUserWithRole, VISIT_ID)
      ).resolves.toEqual(false);
    });

    test('The team lead can edit the visitor list even though they are not a member of the proposal', async () => {
      return expect(
        visitAuth.hasWriteRights(dummyVisitTeamLeadWithRole, VISIT_ID)
      ).resolves.toEqual(true);
    });

    test('A visitor who is not the team lead can not edit the visitor list', async () => {
      return expect(
        visitAuth.hasWriteRights(dummyVisitorWithRole, VISIT_ID)
      ).resolves.toEqual(false);
    });

    test('A second visitor who is not the team lead can not edit the visitor list', async () => {
      return expect(
        visitAuth.hasWriteRights(dummySecondVisitorWithRole, VISIT_ID)
      ).resolves.toEqual(false);
    });

    test('A user unrelated to the proposal and the visit can not edit the visitor list', async () => {
      return expect(
        visitAuth.hasWriteRights(dummyUserNotOnProposalWithRole, VISIT_ID)
      ).resolves.toEqual(false);
    });

    test('An unauthenticated agent can not edit the visitor list', async () => {
      return expect(visitAuth.hasWriteRights(null, VISIT_ID)).resolves.toEqual(
        false
      );
    });

    test('Nobody can edit the visitor list of a visit that does not exist', async () => {
      return expect(
        visitAuth.hasWriteRights(dummyUserWithRole, NON_EXISTENT_VISIT_ID)
      ).resolves.toEqual(false);
    });
  });

  describe('hasReadRights', () => {
    test('A user officer can read the visitor list', async () => {
      return expect(
        visitAuth.hasReadRights(dummyUserOfficerWithRole, VISIT_ID)
      ).resolves.toEqual(true);
    });

    test('The principal investigator can read the visitor list', async () => {
      return expect(
        visitAuth.hasReadRights(dummyPrincipalInvestigatorWithRole, VISIT_ID)
      ).resolves.toEqual(true);
    });

    test('A co-proposer can not read the visitor list', async () => {
      return expect(
        visitAuth.hasReadRights(dummyUserWithRole, VISIT_ID)
      ).resolves.toEqual(false);
    });

    test('The team lead can read the visitor list', async () => {
      return expect(
        visitAuth.hasReadRights(dummyVisitTeamLeadWithRole, VISIT_ID)
      ).resolves.toEqual(true);
    });

    test('A visitor who is not the team lead can read the visitor list', async () => {
      return expect(
        visitAuth.hasReadRights(dummyVisitorWithRole, VISIT_ID)
      ).resolves.toEqual(true);
    });

    test('A second visitor who is not the team lead can read the visitor list', async () => {
      return expect(
        visitAuth.hasReadRights(dummySecondVisitorWithRole, VISIT_ID)
      ).resolves.toEqual(true);
    });

    test('A user unrelated to the proposal and the visit can not read the visitor list', async () => {
      return expect(
        visitAuth.hasReadRights(dummyUserNotOnProposalWithRole, VISIT_ID)
      ).resolves.toEqual(false);
    });

    test('An unauthenticated agent can not read the visitor list', async () => {
      return expect(visitAuth.hasReadRights(null, VISIT_ID)).resolves.toEqual(
        false
      );
    });

    test('Nobody can read the visitor list of a visit that does not exist', async () => {
      return expect(
        visitAuth.hasReadRights(dummyUserWithRole, NON_EXISTENT_VISIT_ID)
      ).resolves.toEqual(false);
    });
  });

  describe('hasCreateRights', () => {
    test('The principal investigator can create a visit', async () => {
      return expect(
        visitAuth.hasCreateRights(
          dummyPrincipalInvestigatorWithRole,
          PROPOSAL_PK
        )
      ).resolves.toEqual(true);
    });

    // A user officer is intentionally NOT granted create rights.
    test('A user officer can not create a visit', async () => {
      return expect(
        visitAuth.hasCreateRights(dummyUserOfficerWithRole, PROPOSAL_PK)
      ).resolves.toEqual(false);
    });

    test('The team lead can not create a visit', async () => {
      return expect(
        visitAuth.hasCreateRights(dummyVisitTeamLeadWithRole, PROPOSAL_PK)
      ).resolves.toEqual(false);
    });

    test('A visitor can not create a visit', async () => {
      return expect(
        visitAuth.hasCreateRights(dummyVisitorWithRole, PROPOSAL_PK)
      ).resolves.toEqual(false);
    });

    test('A co-proposer can not create a visit', async () => {
      return expect(
        visitAuth.hasCreateRights(dummyUserWithRole, PROPOSAL_PK)
      ).resolves.toEqual(false);
    });

    test('A user unrelated to the proposal can not create a visit', async () => {
      return expect(
        visitAuth.hasCreateRights(dummyUserNotOnProposalWithRole, PROPOSAL_PK)
      ).resolves.toEqual(false);
    });

    test('An unauthenticated agent can not create a visit', async () => {
      return expect(
        visitAuth.hasCreateRights(null, PROPOSAL_PK)
      ).resolves.toEqual(false);
    });
  });
});
