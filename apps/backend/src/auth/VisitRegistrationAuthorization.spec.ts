import 'reflect-metadata';
import { container } from 'tsyringe';

import { VisitRegistrationAuthorization } from './VisitRegistrationAuthorization';
import { Tokens } from '../config/Tokens';
import {
  dummyPrincipalInvestigatorWithRole,
  dummySecondVisitorWithRole,
  dummyThirdVisitorWithRole,
  dummyUserOfficerWithRole,
  dummyVisitorWithRole,
  dummyVisitTeamLeadWithRole,
} from '../datasources/mockups/UserDataSource';
import { VisitDataSourceMock } from '../datasources/mockups/VisitDataSource';
import { VisitRegistrationStatus } from '../models/VisitRegistration';

const registrationAuth = container.resolve(VisitRegistrationAuthorization);
const visitDataSource = container.resolve<VisitDataSourceMock>(
  Tokens.VisitDataSource
);

/*
 * A registration carries the startsAt / endsAt timings of a single visitor, so
 * these rights govern who can see and change one person's visit timings.
 * On visit 5 the second visitor's registration is SUBMITTED, the rest are
 * DRAFTED.
 */
const VISIT_ID = 5;

beforeEach(() => {
  visitDataSource.init();
});

describe('VisitRegistrationAuthorization', () => {
  describe('hasReadRights', () => {
    test('A user officer can read the visit timings of any visitor', async () => {
      return expect(
        registrationAuth.hasReadRights(dummyUserOfficerWithRole, {
          visitId: VISIT_ID,
          userId: dummyVisitorWithRole.id,
        })
      ).resolves.toEqual(true);
    });

    test('A visitor can read their own visit timings', async () => {
      return expect(
        registrationAuth.hasReadRights(dummyVisitorWithRole, {
          visitId: VISIT_ID,
          userId: dummyVisitorWithRole.id,
        })
      ).resolves.toEqual(true);
    });

    test('A visitor can not read the visit timings of another visitor', async () => {
      return expect(
        registrationAuth.hasReadRights(dummyVisitorWithRole, {
          visitId: VISIT_ID,
          userId: dummySecondVisitorWithRole.id,
        })
      ).resolves.toEqual(false);
    });

    test('The team lead can not read the visit timings of a visitor', async () => {
      return expect(
        registrationAuth.hasReadRights(dummyVisitTeamLeadWithRole, {
          visitId: VISIT_ID,
          userId: dummyVisitorWithRole.id,
        })
      ).resolves.toEqual(false);
    });

    test('The principal investigator can not read the visit timings of a visitor', async () => {
      return expect(
        registrationAuth.hasReadRights(dummyPrincipalInvestigatorWithRole, {
          visitId: VISIT_ID,
          userId: dummyVisitorWithRole.id,
        })
      ).resolves.toEqual(false);
    });

    test('An unauthenticated agent can not read visit timings', async () => {
      return expect(
        registrationAuth.hasReadRights(null, {
          visitId: VISIT_ID,
          userId: dummyVisitorWithRole.id,
        })
      ).resolves.toEqual(false);
    });

    test('Nobody can read visit timings of a registration that does not exist', async () => {
      return expect(
        registrationAuth.hasReadRights(dummyVisitorWithRole, {
          visitId: VISIT_ID,
          userId: dummyUserOfficerWithRole.id,
        })
      ).resolves.toEqual(false);
    });
  });

  describe('hasWriteRights', () => {
    test('A user officer can edit the visit timings of any visitor', async () => {
      return expect(
        registrationAuth.hasWriteRights(dummyUserOfficerWithRole, {
          visitId: VISIT_ID,
          userId: dummyVisitorWithRole.id,
        })
      ).resolves.toEqual(true);
    });

    test('A visitor can edit their own visit timings while the registration is drafted', async () => {
      return expect(
        registrationAuth.hasWriteRights(dummyVisitorWithRole, {
          visitId: VISIT_ID,
          userId: dummyVisitorWithRole.id,
        })
      ).resolves.toEqual(true);
    });

    test('A visitor can edit their own visit timings when changes have been requested', async () => {
      await visitDataSource.updateRegistration({
        visitId: VISIT_ID,
        userId: dummyThirdVisitorWithRole.id,
        status: VisitRegistrationStatus.CHANGE_REQUESTED,
      });

      return expect(
        registrationAuth.hasWriteRights(dummyThirdVisitorWithRole, {
          visitId: VISIT_ID,
          userId: dummyThirdVisitorWithRole.id,
        })
      ).resolves.toEqual(true);
    });

    test('A visitor can not edit their own visit timings once the registration is submitted', async () => {
      return expect(
        registrationAuth.hasWriteRights(dummySecondVisitorWithRole, {
          visitId: VISIT_ID,
          userId: dummySecondVisitorWithRole.id,
        })
      ).resolves.toEqual(false);
    });

    test('A visitor can not edit the visit timings of another visitor', async () => {
      return expect(
        registrationAuth.hasWriteRights(dummyVisitorWithRole, {
          visitId: VISIT_ID,
          userId: dummyThirdVisitorWithRole.id,
        })
      ).resolves.toEqual(false);
    });

    test('The team lead can not edit the visit timings of a visitor', async () => {
      return expect(
        registrationAuth.hasWriteRights(dummyVisitTeamLeadWithRole, {
          visitId: VISIT_ID,
          userId: dummyVisitorWithRole.id,
        })
      ).resolves.toEqual(false);
    });

    test('The principal investigator can not edit the visit timings of a visitor', async () => {
      return expect(
        registrationAuth.hasWriteRights(dummyPrincipalInvestigatorWithRole, {
          visitId: VISIT_ID,
          userId: dummyVisitorWithRole.id,
        })
      ).resolves.toEqual(false);
    });

    test('An unauthenticated agent can not edit visit timings', async () => {
      return expect(
        registrationAuth.hasWriteRights(null, {
          visitId: VISIT_ID,
          userId: dummyVisitorWithRole.id,
        })
      ).resolves.toEqual(false);
    });
  });
});
