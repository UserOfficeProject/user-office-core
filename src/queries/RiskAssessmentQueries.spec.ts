import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import { RiskAssessmentDataSourceMock as DataSource } from './../datasources/mockups/RiskAssessmentDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
} from './../datasources/mockups/UserDataSource';
import { RiskAssessment } from './../models/RiskAssessment';
import RiskAssessmentQueries from './RiskAssessmentQueries';

const queries = container.resolve(RiskAssessmentQueries);

beforeEach(() => {
  container.resolve<DataSource>(Tokens.RiskAssessmentDataSource).init();
});

test('User on proposal should get risk assessment', async () => {
  await expect(
    queries.getRiskAssessment(
      dummyUserWithRole,
      DataSource.DRAFT_RISK_ASSESSMENT_ID
    )
  ).resolves.toBeInstanceOf(RiskAssessment);

  await expect(
    queries.getRiskAssessment(
      dummyUserWithRole,
      DataSource.SUBMITTED_RISK_ASSESSMENT_ID
    )
  ).resolves.toBeInstanceOf(RiskAssessment);
});

test('User not on proposal should not get risk assessments', async () => {
  return expect(
    queries.getRiskAssessment(
      dummyUserNotOnProposalWithRole,
      DataSource.DRAFT_RISK_ASSESSMENT_ID
    )
  ).resolves.toBeNull();
});

test('User officer should get risk assessment', async () => {
  await expect(
    queries.getRiskAssessment(
      dummyUserOfficerWithRole,
      DataSource.DRAFT_RISK_ASSESSMENT_ID
    )
  ).resolves.toBeInstanceOf(RiskAssessment);

  await expect(
    queries.getRiskAssessment(
      dummyUserOfficerWithRole,
      DataSource.SUBMITTED_RISK_ASSESSMENT_ID
    )
  ).resolves.toBeInstanceOf(RiskAssessment);
});

test('User should get risk assessments by proposal pkey', async () => {
  await expect(
    queries.getRiskAssessments(dummyUserWithRole, { proposalPk: 1 })
  ).resolves.toHaveLength(1);
});

test('User not on proposal should not get risk assessments by proposal pkey', async () => {
  await expect(
    queries.getRiskAssessments(dummyUserNotOnProposalWithRole, {
      proposalPk: 1,
    })
  ).resolves.toHaveLength(0);
});

test('User officer should get risk assessments by proposal pkey', async () => {
  await expect(
    queries.getRiskAssessments(dummyUserOfficerWithRole, {
      proposalPk: 1,
    })
  ).resolves.toHaveLength(1);
});
