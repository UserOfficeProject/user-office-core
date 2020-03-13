import 'reflect-metadata';

import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  UserDataSourceMock,
  dummyUserOfficer,
  dummyUser,
} from '../datasources/mockups/UserDataSource';
import { ProposalTemplate } from '../models/ProposalModel';
import TemplateQueries from '../queries/TemplateQueries';
import { MutedLogger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

const dummyTemplateDataSource = new TemplateDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const templateQueries = new TemplateQueries(
  dummyTemplateDataSource,
  userAuthorization,
  new MutedLogger()
);
beforeEach(() => {
  dummyTemplateDataSource.init();
});

test('Non authentificated user can not get the template', () => {
  return expect(
    templateQueries.getProposalTemplate(null)
  ).resolves.not.toBeInstanceOf(ProposalTemplate);
});

test('User officer user can get the template', () => {
  return expect(
    templateQueries.getProposalTemplate(dummyUserOfficer)
  ).resolves.toBeInstanceOf(ProposalTemplate);
});

test('Proposal template should have fields', async () => {
  const template = (await templateQueries.getProposalTemplate(
    dummyUserOfficer
  )) as ProposalTemplate;

  return expect(template.steps[0].fields.length).toBeGreaterThan(0);
});

test('User officer should be able to get if natural key exists', async () => {
  const exists = await templateQueries.isNaturalKeyPresent(
    dummyUserOfficer,
    'some_key'
  );

  return expect(exists).not.toBe(null);
});

test('User should not be able to get if natural key exists', async () => {
  const exists = await templateQueries.isNaturalKeyPresent(
    dummyUser,
    'some_key'
  );

  return expect(exists).toBe(null);
});
