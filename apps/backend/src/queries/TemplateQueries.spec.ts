jest.mock('axios');

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

test('User officer should be able to get question by natural key', async () => {
  const question = await templateQueries.getQuestionByNaturalKey(
    dummyUserOfficerWithRole,
    'proposal_basis'
  );

  return expect(question).not.toBe(null);
});

describe('getDynamicMultipleChoiceOptions', () => {
  it('should return empty array if there is no question', async () => {
    const options = await templateQueries.getDynamicMultipleChoiceOptions(
      dummyUserWithRole,
      'unknown_question_id'
    );

    expect(options).toEqual([]);
  });

  it('should return empty array if url is empty', async () => {
    const options = await templateQueries.getDynamicMultipleChoiceOptions(
      dummyUserWithRole,
      'dmcQuestionEmptyUrl'
    );

    expect(options).toEqual([]);
  });

  it('should return the options if the response is an array of strings', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(['option1', 'option2']),
        ok: true,
      } as Response)
    );

    const options = await templateQueries.getDynamicMultipleChoiceOptions(
      dummyUserWithRole,
      'dmcQuestionEmptyJsonPath'
    );

    expect(options).toEqual(['option1', 'option2']);

    // Check that the request was made with the correct url and headers
    expect(fetchMock).toHaveBeenCalledWith('api-url', {
      headers: {
        header1: 'value1',
        header2: 'value2',
      },
    });
  });

  it('should return empty array if the response is not an array and jsonPath is empty', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve('not an array'),
      } as Response)
    );

    const options = await templateQueries.getDynamicMultipleChoiceOptions(
      dummyUserWithRole,
      'dmcQuestionEmptyJsonPath'
    );

    expect(options).toEqual([]);
  });

  it('should return the options if the response is not an array and jsonPath is set', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([{ option: 'option1' }, { option: 'option2' }]),
        ok: true,
      } as Response)
    );

    const options = await templateQueries.getDynamicMultipleChoiceOptions(
      dummyUserWithRole,
      'dmcQuestionWithUrlAndJsonPath'
    );

    expect(options).toEqual(['option1', 'option2']);
  });
});
