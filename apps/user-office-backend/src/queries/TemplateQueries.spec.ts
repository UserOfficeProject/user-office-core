import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { Template, TemplateStep } from '../models/Template';
import TemplateQueries from './TemplateQueries';

const templateQueries = container.resolve(TemplateQueries);
beforeEach(() => {
  container.resolve<TemplateDataSourceMock>(Tokens.TemplateDataSource).init();
});

test('Non authentificated user can not get the template', () => {
  return expect(
    templateQueries.getTemplate(null, 1)
  ).resolves.not.toBeInstanceOf(Template);
});

test('User officer user can get the template', () => {
  return expect(
    templateQueries.getTemplate(dummyUserOfficerWithRole, 1)
  ).resolves.toBeInstanceOf(Template);
});

test('Proposal template should have fields', async () => {
  let steps = await templateQueries.getTemplateSteps(
    dummyUserOfficerWithRole,
    1
  );
  steps = steps as TemplateStep[];

  return expect(steps[0].fields.length).toBeGreaterThan(0);
});

test('User officer should be able to get if natural key exists', async () => {
  const exists = await templateQueries.isNaturalKeyPresent(
    dummyUserOfficerWithRole,
    'some_key'
  );

  return expect(exists).not.toBe(null);
});

test('User should not be able to get if natural key exists', async () => {
  const exists = await templateQueries.isNaturalKeyPresent(
    dummyUserWithRole,
    'some_key'
  );

  return expect(exists).toBe(null);
});

test('User officer should get a list of templates', async () => {
  const templates = await templateQueries.getTemplates(
    dummyUserOfficerWithRole,
    {
      filter: { isArchived: false },
    }
  );

  expect(templates.length).toBeGreaterThan(0);
  expect(templates[0].isArchived).toEqual(false);
});
