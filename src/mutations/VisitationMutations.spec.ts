import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  dummyUserWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import { VisitationDataSourceMock } from './../datasources/mockups/VisitationDataSource';
import { Rejection } from './../models/Rejection';
import { Visitation, VisitationStatus } from './../models/Visitation';
import VisitationMutations from './VisitationMutations';

const mutations = container.resolve(VisitationMutations);

beforeEach(() => {
  container
    .resolve<VisitationDataSourceMock>(Tokens.VisitationDataSource)
    .init();
});

test('User can create visitation for his proposal', async () => {
  await expect(
    mutations.createVisitation(dummyUserWithRole, { proposalId: 1 })
  ).resolves.toBeInstanceOf(Visitation);
});

test('User cannot create visitation for someone elses proposal', async () => {
  await expect(
    mutations.createVisitation(dummyUserWithRole, { proposalId: 99 })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User can update visitation', async () => {
  const visitation = (await mutations.createVisitation(dummyUserWithRole, {
    proposalId: 1,
  })) as Visitation;

  expect(visitation.status).toEqual(VisitationStatus.DRAFT);

  await mutations.updateVisitation(dummyUserWithRole, {
    visitationId: visitation.id,
    status: VisitationStatus.SUBMITTED,
  });

  expect(visitation.status).toEqual(VisitationStatus.SUBMITTED);
});

test('User can not update visitation that is already accepted', async () => {
  await mutations.updateVisitation(dummyUserOfficerWithRole, {
    visitationId: 1,
    status: VisitationStatus.ACCEPTED,
  });

  await expect(
    mutations.updateVisitation(dummyUserWithRole, {
      visitationId: 1,
      status: VisitationStatus.DRAFT,
    })
  ).resolves.toBeInstanceOf(Rejection);
});
test('User can not delete visitation that is already accepted', async () => {
  await mutations.updateVisitation(dummyUserWithRole, {
    visitationId: 1,
    status: VisitationStatus.SUBMITTED,
  });

  await expect(
    mutations.deleteVisitation(dummyUserWithRole, 1)
  ).resolves.not.toBeInstanceOf(Rejection);
});

test('User cannot set the state to ACCEPTED', async () => {
  await expect(
    mutations.updateVisitation(dummyUserWithRole, {
      visitationId: 1,
      status: VisitationStatus.ACCEPTED,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User officer can set the state to ACCEPTED', async () => {
  await expect(
    mutations.updateVisitation(dummyUserOfficerWithRole, {
      visitationId: 1,
      status: VisitationStatus.ACCEPTED,
    })
  ).resolves.not.toBeInstanceOf(Rejection);
});

test('User cannot delete accepted visitation', async () => {
  await mutations.updateVisitation(dummyUserOfficerWithRole, {
    visitationId: 1,
    status: VisitationStatus.ACCEPTED,
  });

  await expect(
    mutations.deleteVisitation(dummyUserWithRole, 1)
  ).resolves.toBeInstanceOf(Rejection);
});

test('User officer can delete visitation', async () => {
  await mutations.updateVisitation(dummyUserOfficerWithRole, {
    visitationId: 1,
    status: VisitationStatus.ACCEPTED,
  });

  await expect(
    mutations.deleteVisitation(dummyUserOfficerWithRole, 1)
  ).resolves.not.toBeInstanceOf(Rejection);
});
