import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  dummyUserNotOnProposalWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { VisitDataSourceMock } from '../datasources/mockups/VisitDataSource';
import { ExperimentSafetyInput } from '../models/ExperimentSafetyInput';
import { Tokens } from './../config/Tokens';
import { ProposalEsiDataSourceMock } from './../datasources/mockups/ProposalEsiDataSource';
import { dummyUserOfficerWithRole } from './../datasources/mockups/UserDataSource';
import { Rejection } from './../models/Rejection';
import ProposalEsiMutations from './ProposalEsiMutations';

const mutations = container.resolve(ProposalEsiMutations);

beforeEach(() => {
  container
    .resolve<ProposalEsiDataSourceMock>(Tokens.ProposalEsiDataSource)
    .init();
  container.resolve<VisitDataSourceMock>(Tokens.VisitDataSource).init();
});

test('A user on the visit can create ESI', () => {
  return expect(
    mutations.createEsi(dummyUserWithRole, 1)
  ).resolves.toBeInstanceOf(ExperimentSafetyInput);
});

test('A user NOT on the visit can NOT create ESI', () => {
  return expect(
    mutations.createEsi(dummyUserNotOnProposalWithRole, 1)
  ).resolves.toBeInstanceOf(Rejection);
});

test('A user can not modify submitted ESI', async () => {
  await mutations.updateEsi(dummyUserWithRole, { esiId: 1, isSubmitted: true });

  return expect(
    mutations.updateEsi(dummyUserWithRole, { esiId: 1, isSubmitted: false })
  ).resolves.toBeInstanceOf(Rejection);
});

test('A user can modify submitted ESI', async () => {
  await mutations.updateEsi(dummyUserOfficerWithRole, {
    esiId: 1,
    isSubmitted: true,
  });

  return expect(
    mutations.updateEsi(dummyUserOfficerWithRole, {
      esiId: 1,
      isSubmitted: false,
    })
  ).resolves.toBeInstanceOf(ExperimentSafetyInput);
});
