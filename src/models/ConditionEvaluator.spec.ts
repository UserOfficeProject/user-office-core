import { Answer } from '../generated/sdk';
import { create1Topic3FieldWithDependenciesQuestionary } from '../tests/ProposalTestBed';
import {
  areDependenciesSatisfied,
  getFieldById,
} from './ProposalModelFunctions';

test('Is dependency checking working', () => {
  const template = create1Topic3FieldWithDependenciesQuestionary();
  expect(
    areDependenciesSatisfied(template.steps, 'has_links_with_industry')
  ).toBe(true);

  expect(areDependenciesSatisfied(template.steps, 'links_with_industry')).toBe(
    false
  );
});

test('Updating value changes dependency satisfaction', () => {
  const template = create1Topic3FieldWithDependenciesQuestionary();

  expect(areDependenciesSatisfied(template.steps, 'links_with_industry')).toBe(
    false
  );

  (getFieldById(template.steps, 'has_links_with_industry') as Answer)!.value =
    'yes';
  expect(areDependenciesSatisfied(template.steps, 'links_with_industry')).toBe(
    true
  );
});
