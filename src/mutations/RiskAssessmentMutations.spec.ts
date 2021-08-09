import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import { Rejection } from '../models/Rejection';
import { RiskAssessmentDataSourceMock as DataSource } from './../datasources/mockups/RiskAssessmentDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
} from './../datasources/mockups/UserDataSource';
import {
  RiskAssessment,
  RiskAssessmentStatus,
} from './../models/RiskAssessment';
import RiskAssessmentMutations from './RiskAssessmentMutations';

const mutations = container.resolve(RiskAssessmentMutations);

beforeEach(() => {
  container.resolve<DataSource>(Tokens.RiskAssessmentDataSource).init();
});

test('User should not be able to create risk assessment for not accepted proposal', async () => {
  return expect(
    mutations.createRiskAssessment(dummyUserWithRole, { proposalPk: 1 })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User should be able to create risk assessment for accepted proposal', async () => {
  return expect(
    mutations.createRiskAssessment(dummyUserWithRole, { proposalPk: 2 })
  ).resolves.toBeInstanceOf(RiskAssessment);
});

test('User not on proposal should not be able to create risk assessment', () => {
  return expect(
    mutations.createRiskAssessment(dummyUserNotOnProposalWithRole, {
      proposalPk: 2,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User should be able to update risk assessment', () => {
  return expect(
    mutations.updateRiskAssessment(dummyUserWithRole, {
      riskAssessmentId: DataSource.DRAFT_RISK_ASSESSMENT_ID,
      status: RiskAssessmentStatus.SUBMITTED,
    })
  ).resolves.toBeInstanceOf(RiskAssessment);
});

test('User officer should be able to update submitted risk assessment', async () => {
  return expect(
    mutations.updateRiskAssessment(dummyUserOfficerWithRole, {
      riskAssessmentId: DataSource.SUBMITTED_RISK_ASSESSMENT_ID,
      status: RiskAssessmentStatus.DRAFT,
    })
  ).resolves.toBeInstanceOf(RiskAssessment);
});

test('User should not be able to update submitted risk assessment', () => {
  return expect(
    mutations.updateRiskAssessment(dummyUserWithRole, {
      riskAssessmentId: DataSource.SUBMITTED_RISK_ASSESSMENT_ID,
      status: RiskAssessmentStatus.DRAFT,
    })
  ).resolves.toBeInstanceOf(Rejection);
});

test('User should be able to delete risk assessment', () => {
  return expect(
    mutations.deleteRiskAssessment(
      dummyUserWithRole,
      DataSource.DRAFT_RISK_ASSESSMENT_ID
    )
  ).resolves.toBeInstanceOf(RiskAssessment);
});

test('User should not be able to delete submitted risk assessment', () => {
  return expect(
    mutations.deleteRiskAssessment(
      dummyUserWithRole,
      DataSource.SUBMITTED_RISK_ASSESSMENT_ID
    )
  ).resolves.toBeInstanceOf(Rejection);
});

test('User officer should be able to delete submitted risk assessment', () => {
  return expect(
    mutations.deleteRiskAssessment(
      dummyUserOfficerWithRole,
      DataSource.SUBMITTED_RISK_ASSESSMENT_ID
    )
  ).resolves.toBeInstanceOf(RiskAssessment);
});
