import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import { VisitDataSourceMock } from '../datasources/mockups/VisitDataSource';
import { Rejection } from '../models/Rejection';
import { Visit } from '../models/Visit';
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

test('User can not set the state to ACCEPTED', async () => {});

test('User officer can set the state to ACCEPTED', async () => {});

test('User officer can delete visit', async () => {});
