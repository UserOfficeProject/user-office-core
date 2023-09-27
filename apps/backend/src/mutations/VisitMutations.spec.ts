import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  dummyUserWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import { VisitDataSourceMock } from '../datasources/mockups/VisitDataSource';
import { Rejection } from '../models/Rejection';
import { Visit, VisitStatus } from '../models/Visit';
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

  expect(visit.status).toEqual(VisitStatus.DRAFT);

  await mutations.updateVisit(dummyUserWithRole, {
    visitId: visit.id,
    status: VisitStatus.SUBMITTED,
  });

  expect(visit.status).toEqual(VisitStatus.SUBMITTED);
});

test('User can not update visit that is already accepted', async () => {
  await mutations.updateVisit(dummyUserOfficerWithRole, {
    visitId: 1,
    status: VisitStatus.ACCEPTED,
  });

  await expect(
    mutations.updateVisit(dummyUserWithRole, {
      visitId: 1,
      status: VisitStatus.DRAFT,
    })
  ).resolves.toBeInstanceOf(Rejection);
});
test('User can not delete visit that is already accepted', async () => {
  await mutations.updateVisit(dummyUserWithRole, {
    visitId: 1,
    status: VisitStatus.SUBMITTED,
  });

  await expect(
    mutations.deleteVisit(dummyUserWithRole, 1)
  ).resolves.not.toBeInstanceOf(Rejection);
});

test('User can not set the state to ACCEPTED', async () => {
  await expect(
    mutations.updateVisit(dummyUserWithRole, {
      visitId: 1,
      status: VisitStatus.ACCEPTED,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User officer can set the state to ACCEPTED', async () => {
  await expect(
    mutations.updateVisit(dummyUserOfficerWithRole, {
      visitId: 1,
      status: VisitStatus.ACCEPTED,
    })
  ).resolves.not.toBeInstanceOf(Rejection);
});

test('User can not delete accepted visit', async () => {
  await mutations.updateVisit(dummyUserOfficerWithRole, {
    visitId: 1,
    status: VisitStatus.ACCEPTED,
  });

  await expect(
    mutations.deleteVisit(dummyUserWithRole, 1)
  ).resolves.toBeInstanceOf(Rejection);
});

test('User officer can delete visit', async () => {
  await mutations.updateVisit(dummyUserOfficerWithRole, {
    visitId: 1,
    status: VisitStatus.ACCEPTED,
  });

  await expect(
    mutations.deleteVisit(dummyUserOfficerWithRole, 1)
  ).resolves.not.toBeInstanceOf(Rejection);
});
