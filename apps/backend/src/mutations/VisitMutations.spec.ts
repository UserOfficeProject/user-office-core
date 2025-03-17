import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { VisitDataSourceMock } from '../datasources/mockups/VisitDataSource';
import { Rejection } from '../models/Rejection';
import { Visit } from '../models/Visit';
import {
  VisitRegistration,
  VisitRegistrationStatus,
} from '../models/VisitRegistration';
import VisitMutations from './VisitMutations';

const mutations = container.resolve(VisitMutations);
const visitDataSource = container.resolve<VisitDataSourceMock>(
  Tokens.VisitDataSource
);

beforeEach(() => {
  visitDataSource.init();
});

test('User can create visit for his proposal', async () => {
  await expect(
    mutations.createVisit(dummyUserWithRole, {
      experimentPk: 2,
      teamLeadUserId: 1,
      team: [1],
    })
  ).resolves.toBeInstanceOf(Visit);
});

test('User can not create visit for proposal that is not accepted', async () => {
  await expect(
    mutations.createVisit(dummyUserWithRole, {
      experimentPk: 1,
      teamLeadUserId: dummyUserWithRole.id,
      team: [dummyUserWithRole.id],
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User can not create visit for someone elses proposal', async () => {
  await expect(
    mutations.createVisit(dummyUserWithRole, {
      experimentPk: 3,
      teamLeadUserId: dummyUserWithRole.id,
      team: [dummyUserWithRole.id],
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User can update visit', async () => {
  const visit = (await mutations.createVisit(dummyUserWithRole, {
    experimentPk: 2,
    teamLeadUserId: dummyUserWithRole.id,
    team: [dummyUserWithRole.id],
  })) as Visit;

  await mutations.updateVisit(dummyUserWithRole, {
    visitId: visit.id,
    teamLeadUserId: 1,
  });

  expect(visit.teamLeadUserId).toEqual(1);
});

test('User can not himself approve visit registration', async () => {
  const visit = (await mutations.createVisit(dummyUserWithRole, {
    experimentPk: 2,
    teamLeadUserId: dummyUserWithRole.id,
    team: [dummyUserWithRole.id],
  })) as Visit;

  await expect(
    mutations.approveVisitRegistration(dummyUserWithRole, {
      visitId: visit.id,
      userId: dummyUserWithRole.id,
    })
  ).resolves.toMatchObject({ message: 'INSUFFICIENT_PERMISSIONS' });
});

test('User can not update visit registration that is already submitted', async () => {
  const registration = (await mutations.submitVisitRegistration(
    dummyUserWithRole,
    {
      visitId: 1,
      userId: 2,
    }
  )) as VisitRegistration;

  expect(registration.status).toEqual(VisitRegistrationStatus.SUBMITTED);

  const updateResult = await mutations.updateVisitRegistration(
    dummyUserWithRole,
    {
      visitId: 1,
      userId: 2,
      startsAt: new Date(),
      endsAt: new Date(),
    }
  );

  expect(updateResult).toBeInstanceOf(Rejection);
});

test('User office can approve visit registration', async () => {
  const registration = (await mutations.submitVisitRegistration(
    dummyUserWithRole,
    {
      visitId: 1,
      userId: 2,
    }
  )) as VisitRegistration;

  expect(registration.status).toEqual(VisitRegistrationStatus.SUBMITTED);

  const updateResult = (await mutations.approveVisitRegistration(
    dummyUserOfficerWithRole,
    {
      visitId: 1,
      userId: 2,
    }
  )) as VisitRegistration;

  expect(updateResult.status).toEqual(VisitRegistrationStatus.APPROVED);
});

test('User can create visit registration', async () => {
  const registration = (await mutations.createVisitRegistration(
    dummyUserWithRole,
    1,
    2
  )) as VisitRegistration;

  expect(registration).toBeInstanceOf(VisitRegistration);
});

test('Not authorized user can not create visit registration', async () => {
  await expect(
    mutations.createVisitRegistration(null, 1, 2)
  ).resolves.toBeInstanceOf(Rejection);
});

describe('User officer can cancel the visit registration', () => {
  test.each([
    VisitRegistrationStatus.DRAFTED,
    VisitRegistrationStatus.SUBMITTED,
    VisitRegistrationStatus.APPROVED,
    VisitRegistrationStatus.CHANGE_REQUESTED,
  ])(
    'User officer can cancel the visit registration when status is %s',
    async (status) => {
      // Create a new registration
      const registration = (await mutations.createVisitRegistration(
        dummyUserWithRole,
        1,
        2
      )) as VisitRegistration;

      // Update the registration with the parameterized status
      visitDataSource.updateRegistration({
        visitId: registration.visitId,
        userId: registration.userId,
        status: status, // parameterized status
      });

      // Attempt to cancel the visit registration as a user officer
      const cancelResult = (await mutations.cancelVisitRegistration(
        dummyUserOfficerWithRole,
        {
          visitId: 1,
          userId: 2,
        }
      )) as VisitRegistration;

      // Verify that the cancel operation was successful
      expect(cancelResult.status).toEqual(
        VisitRegistrationStatus.CANCELLED_BY_FACILITY
      );
    }
  );
});

describe('User can cancel their visit registration', () => {
  test.each`
    initialStatus                                    | expectedStatus
    ${VisitRegistrationStatus.DRAFTED}               | ${VisitRegistrationStatus.CANCELLED_BY_USER}
    ${VisitRegistrationStatus.SUBMITTED}             | ${VisitRegistrationStatus.CANCELLED_BY_USER}
    ${VisitRegistrationStatus.APPROVED}              | ${VisitRegistrationStatus.CANCELLED_BY_USER}
    ${VisitRegistrationStatus.CHANGE_REQUESTED}      | ${VisitRegistrationStatus.CANCELLED_BY_USER}
    ${VisitRegistrationStatus.CANCELLED_BY_USER}     | ${VisitRegistrationStatus.CANCELLED_BY_USER}
    ${VisitRegistrationStatus.CANCELLED_BY_FACILITY} | ${VisitRegistrationStatus.CANCELLED_BY_FACILITY}
  `(
    'User can cancel registration with initial status $initialStatus resulting in $expectedStatus',
    async ({ initialStatus, expectedStatus }) => {
      // Create a registration (default status is DRAFTED)
      const registration = (await mutations.createVisitRegistration(
        dummyUserWithRole,
        1,
        2
      )) as VisitRegistration;

      // Update the registration status to the parameterized initial status
      await visitDataSource.updateRegistration({
        visitId: registration.visitId,
        userId: registration.userId,
        status: initialStatus,
      });

      // Attempt to cancel the registration as the user
      await mutations.cancelVisitRegistration(dummyUserWithRole, {
        visitId: registration.visitId,
        userId: registration.userId,
      });

      await expect(
        visitDataSource.getRegistration(
          registration.userId,
          registration.visitId
        )
      ).resolves.toHaveProperty('status', expectedStatus);
    }
  );
});

test('User can not submit visit registration that has been cancelled by facility', async () => {
  const registration = (await mutations.createVisitRegistration(
    dummyUserWithRole,
    1,
    2
  )) as VisitRegistration;

  expect(registration.status).toEqual(VisitRegistrationStatus.DRAFTED);

  const cancelResult = (await mutations.cancelVisitRegistration(
    dummyUserOfficerWithRole,
    {
      visitId: 1,
      userId: 2,
    }
  )) as VisitRegistration;

  expect(cancelResult.status).toEqual(
    VisitRegistrationStatus.CANCELLED_BY_FACILITY
  );

  const submitResult = (await mutations.submitVisitRegistration(
    dummyUserWithRole,
    {
      visitId: 1,
      userId: 2,
    }
  )) as VisitRegistration;
  expect(submitResult).toHaveProperty(
    'reason',
    'Chould not submit Visit Registration due to insufficient permissions'
  );
});
