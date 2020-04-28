import 'reflect-metadata';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUser,
  dummyUserOfficer,
} from '../datasources/mockups/UserDataSource';
import { ProposalTemplate, TemplateStep } from '../models/ProposalModel';
import TemplateQueries from './TemplateQueries';

const dummyTemplateDataSource = new TemplateDataSourceMock();
const templateQueries = new TemplateQueries(dummyTemplateDataSource);
beforeEach(() => {
  dummyTemplateDataSource.init();
});

test('Non authentificated user can not get the template', () => {
  return expect(
    templateQueries.getProposalTemplate(null, 1)
  ).resolves.not.toBeInstanceOf(ProposalTemplate);
});

test('User officer user can get the template', () => {
  return expect(
    templateQueries.getProposalTemplate(dummyUserOfficer, 1)
  ).resolves.toBeInstanceOf(ProposalTemplate);
});

test('Proposal template should have fields', async () => {
  let steps = await templateQueries.getProposalTemplateSteps(
    dummyUserOfficer,
    1
  );
  steps = steps as TemplateStep[];

  return expect(steps[0].fields.length).toBeGreaterThan(0);
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

test('User officer should get a list of templates', async () => {
  const templates = await templateQueries.getProposalTemplates(
    dummyUserOfficer,
    {
      filter: { isArchived: false },
    }
  );

  expect(templates.length).toBeGreaterThan(0);
  expect(templates[0].isArchived).toEqual(false);
});
