import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { Rejection } from '../models/Rejection';
import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { QuestionaryDataSourceMock } from './../datasources/mockups/QuestionaryDataSource';
import { SampleDataSourceMock } from './../datasources/mockups/SampleDataSource';
import { SampleEsiDataSourceMock } from './../datasources/mockups/SampleEsiDataSource';
import { TemplateDataSourceMock } from './../datasources/mockups/TemplateDataSource';
import { VisitDataSourceMock } from './../datasources/mockups/VisitDataSource';
import SampleEsiMutations from './SampleEsiMutations';

const mutations = container.resolve(SampleEsiMutations);

beforeEach(() => {
  container.resolve<SampleEsiDataSourceMock>(Tokens.SampleEsiDataSource).init();
  container.resolve<SampleDataSourceMock>(Tokens.SampleDataSource).init();
  container.resolve<TemplateDataSourceMock>(Tokens.TemplateDataSource).init();
  container.resolve<VisitDataSourceMock>(Tokens.VisitDataSource).init();
  container.resolve<TemplateDataSourceMock>(Tokens.TemplateDataSource).init();
  container
    .resolve<QuestionaryDataSourceMock>(Tokens.QuestionaryDataSource)
    .init();
});

test('A user on the visit can create sample ESI', () => {
  return expect(
    mutations.createSampleEsi(dummyUserWithRole, { esiId: 1, sampleId: 1 })
  ).resolves.toBeInstanceOf(SampleExperimentSafetyInput);
});

test('A user NOT on the visit can NOT create sample ESI', () => {
  return expect(
    mutations.createSampleEsi(dummyUserNotOnProposalWithRole, {
      esiId: 1,
      sampleId: 1,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('A user can update the Sample ESI', () => {
  return expect(
    mutations.updateSampleEsi(dummyUserWithRole, {
      esiId: 1,
      sampleId: 1,
      isSubmitted: true,
    })
  ).resolves.toBeInstanceOf(SampleExperimentSafetyInput);
});

test('A user not on the visit can NOT update the Sample ESI', () => {
  return expect(
    mutations.updateSampleEsi(dummyUserNotOnProposalWithRole, {
      esiId: 1,
      sampleId: 1,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('A useron the visit can clone the Sample ESI', () => {
  return expect(
    mutations.cloneSampleEsi(dummyUserWithRole, {
      esiId: 1,
      sampleId: 1,
    })
  ).resolves.toBeInstanceOf(SampleExperimentSafetyInput);
});

test('A user not on the visit can NOT clone the Sample ESI', () => {
  return expect(
    mutations.cloneSampleEsi(dummyUserNotOnProposalWithRole, {
      esiId: 1,
      sampleId: 1,
    })
  ).resolves.toBeInstanceOf(Rejection);
});
