import 'reflect-metadata';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { DataType, Question, Template, Topic } from '../models/ProposalModel';
import { isRejection } from '../rejection';
import TemplateMutations from './TemplateMutations';

const dummyTemplateDataSource = new TemplateDataSourceMock();

const mutations = new TemplateMutations(dummyTemplateDataSource);

beforeEach(() => {
  dummyTemplateDataSource.init();
});

test('An userofficer can update topic', async () => {
  const newTopicTitle = 'new topic title';
  const topicEnabled = false;
  const topic = await mutations.updateTopic(dummyUserOfficerWithRole, {
    id: 1,
    title: newTopicTitle,
    isEnabled: topicEnabled,
  });
  expect(topic instanceof Topic).toBe(true);
  expect((topic as Topic).title).toEqual(newTopicTitle);
  expect((topic as Topic).isEnabled).toEqual(topicEnabled);
});

test('An userofficer can create template', async () => {
  const name = 'The name';
  const description = 'The description';
  const template = await mutations.createTemplate(dummyUserOfficerWithRole, {
    name,
    description,
  });
  expect(template instanceof Template).toBe(true);
  expect((template as Template).name).toEqual(name);
  expect((template as Template).description).toEqual(description);
});
test('An user cannot create template', async () => {
  const name = 'The name';
  const description = 'The description';
  const template = await mutations.createTemplate(dummyUserWithRole, {
    name,
    description,
  });
  expect(template instanceof Template).toBe(false);
});

test('An userofficer can delete template', async () => {
  const id = 1;
  const template = await mutations.deleteTemplate(dummyUserOfficerWithRole, id);
  expect(template instanceof Template).toBe(true);
  expect((template as Template).templateId).toEqual(id);
});

test('An user can not delete template', async () => {
  const id = 1;
  const template = await mutations.deleteTemplate(dummyUserWithRole, id);
  expect(template instanceof Template).toBe(false);
});

test('A user can not update topic', async () => {
  const topic = await mutations.updateTopic(dummyUserWithRole, {
    id: 1,
    title: 'New topic title',
    isEnabled: false,
  });

  expect(topic instanceof Topic).toBe(false);
});

test('A user-officer can create topic', async () => {
  const response = await mutations.createTopic(dummyUserOfficerWithRole, {
    templateId: 1,
    sortOrder: 0,
  });
  expect(isRejection(response)).toBe(false);
});

test('A user can not create topic', async () => {
  const response = await mutations.createTopic(dummyUserOfficerWithRole, {
    templateId: 1,
    sortOrder: 0,
  });
  expect(isRejection(response)).toBe(false);
});

test('A user-officer can update question topic rel', async () => {
  const response = await mutations.updateQuestionsTopicRels(
    dummyUserOfficerWithRole,
    {
      templateId: 1,
      topicId: 1,
      questionIds: ['has_links_with_industry', 'enable_crystallization'],
    }
  );
  expect(isRejection(response)).toEqual(false);
  expect((response as string[])[0]).toEqual('has_links_with_industry');
});

test('A user can not update question topic rel', async () => {
  const response = await mutations.updateQuestionsTopicRels(dummyUserWithRole, {
    templateId: 1,
    topicId: 1,
    questionIds: ['has_links_with_industry', 'enable_crystallization'],
  });
  expect(isRejection(response)).toEqual(true);
});

test('User can not create question', async () => {
  const response = await mutations.createQuestion(dummyUserWithRole, {
    dataType: DataType.EMBELLISHMENT,
  });
  expect(response).not.toBeInstanceOf(Template);
});

test('User officer can create question', async () => {
  const response = await mutations.createQuestion(dummyUserOfficerWithRole, {
    dataType: DataType.EMBELLISHMENT,
  });
  expect(response).toBeInstanceOf(Question);

  const newField = response as Question;
  expect(newField.dataType).toEqual(DataType.EMBELLISHMENT);
});

test('User can not delete question', async () => {
  await expect(
    mutations.deleteQuestion(dummyUserWithRole, { questionId: 'field_id' })
  ).resolves.not.toBeInstanceOf(Question);
});

test('User officer can delete question', async () => {
  await expect(
    mutations.deleteQuestion(dummyUserOfficerWithRole, {
      questionId: 'field_id',
    })
  ).resolves.toBeInstanceOf(Question);
});

test('Officer can update topic order', async () => {
  return expect(
    mutations.updateTopicOrder(dummyUserOfficerWithRole, {
      topicOrder: [1, 3, 2],
    })
  ).resolves.toBeTruthy();
});

test('User can not update topic order', async () => {
  const result = await mutations.updateTopicOrder(dummyUserWithRole, {
    topicOrder: [1, 3, 2],
  });

  return expect(isRejection(result)).toBeTruthy();
});

test('Officer can delete a topic', async () => {
  const topic = await mutations.deleteTopic(dummyUserOfficerWithRole, {
    topicId: 1,
  });
  expect(topic instanceof Topic).toBe(true);
});

test('Dummy user can not delete a topic', async () => {
  const topic = await mutations.deleteTopic(dummyUserWithRole, { topicId: 1 });
  expect(topic instanceof Topic).toBe(false);
});

test('User can not update question rel', async () => {
  const steps = await mutations.updateQuestionRel(dummyUserWithRole, {
    templateId: 1,
    questionId: 'links_to_field',
    sortOrder: 2,
    topicId: 1,
  });
  expect(isRejection(steps)).toBe(true);
});

test('User officer can update question rel', async () => {
  const response = await mutations.updateQuestionRel(dummyUserOfficerWithRole, {
    templateId: 1,
    questionId: 'links_to_field',
    sortOrder: 2,
  });
  expect(isRejection(response)).toBe(false);
});

test('User can not delete question rel', async () => {
  const response = await mutations.deleteQuestionRel(dummyUserWithRole, {
    templateId: 1,
    questionId: 'links_to_field',
  });
  expect(isRejection(response)).toBe(true);
});

test('User officer can delete question rel', async () => {
  const response = await mutations.deleteQuestionRel(dummyUserOfficerWithRole, {
    templateId: 1,
    questionId: 'links_to_field',
  });
  expect(isRejection(response)).toBe(false);
});

test('User can not update proposal template', async () => {
  const steps = await mutations.updateProposalTemplate(dummyUserWithRole, {
    templateId: 1,
    description: 'New descsription',
    isArchived: false,
    name: 'New name',
  });
  expect(isRejection(steps)).toBe(true);
});

test('User officer can update proposal template', async () => {
  const newDescription = 'new description';
  const newName = 'new name';
  const newIsArchived = true;
  let template = await mutations.updateProposalTemplate(
    dummyUserOfficerWithRole,
    {
      templateId: 1,
      description: newDescription,
      isArchived: newIsArchived,
      name: newName,
    }
  );
  expect(isRejection(template)).toBe(false);
  template = template as Template;
  expect(template.description).toEqual(newDescription);
  expect(template.isArchived).toEqual(newIsArchived);
  expect(template.name).toEqual(newName);
});

test('User can not update question template', async () => {
  const steps = await mutations.updateQuestion(dummyUserWithRole, {
    id: 'links_to_field',
    question: 'new text',
  });
  expect(isRejection(steps)).toBe(true);
});
