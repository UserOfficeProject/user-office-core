import {
  create1Topic3FieldWithDependenciesQuestionary,
  create1TopicFieldlessTemplate,
} from '../tests/ProposalTestBed';
import {
  getAllFields,
  getFieldById,
  getTopicById,
  getQuestionaryStepByTopicId,
} from './ProposalModelFunctions';

test('Can parse object', () => {
  const template = create1Topic3FieldWithDependenciesQuestionary();
  expect(getAllFields(template.steps).length).toBe(3);
  expect(
    getFieldById(template.steps, 'links_with_industry')!.dependency
  ).not.toBe(null);
  expect(
    getFieldById(template.steps, 'links_with_industry')!.dependency
      ?.dependencyId
  ).toBe('has_links_with_industry');

  const fieldlessTemplate = create1TopicFieldlessTemplate();
  expect(
    getQuestionaryStepByTopicId(fieldlessTemplate.steps, 0)!.fields.length
  ).toBe(0);
  expect(getTopicById(fieldlessTemplate.steps, 1)).toBe(undefined);
});
