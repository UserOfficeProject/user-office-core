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

beforeEach(() => {
  container.resolve<VisitDataSourceMock>(Tokens.VisitDataSource).init();
});

test('User can create visit for his proposal', async () => {
  await expect(
    mutations.createVisit(dummyUserWithRole, {
      scheduledEventId: 2,
      teamLeadUserId: 1,
      team: [1],
    })
  ).resolves.toBeInstanceOf(Visit);
});

test('User can not create visit for proposal that is not accepted', async () => {
  await expect(
    mutations.createVisit(dummyUserWithRole, {
      scheduledEventId: 1,
      teamLeadUserId: dummyUserWithRole.id,
      team: [dummyUserWithRole.id],
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User can not create visit for someone elses proposal', async () => {
  await expect(
    mutations.createVisit(dummyUserWithRole, {
      scheduledEventId: 3,
      teamLeadUserId: dummyUserWithRole.id,
      team: [dummyUserWithRole.id],
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User can update visit', async () => {
  const visit = (await mutations.createVisit(dummyUserWithRole, {
    scheduledEventId: 2,
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
    scheduledEventId: 2,
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

test('Not authorized user can not create visit registartion', async () => {
  await expect(
    mutations.createVisitRegistration(null, 1, 2)
  ).resolves.toBeInstanceOf(Rejection);
});
