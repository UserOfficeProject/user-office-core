import 'reflect-metadata';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUser,
  dummyUserOfficer,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import {
  DataType,
  ProposalTemplate,
  Question,
  Topic,
} from '../models/ProposalModel';
import TemplateQueries from '../queries/TemplateQueries';
import { isRejection } from '../rejection';
import { MutedLogger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import TemplateMutations from './TemplateMutations';

const dummyLogger = new MutedLogger();
const dummyTemplateDataSource = new TemplateDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);

const queries = new TemplateQueries(dummyTemplateDataSource);
const mutations = new TemplateMutations(
  dummyTemplateDataSource,
  userAuthorization,
  dummyLogger
);

beforeEach(() => {
  dummyTemplateDataSource.init();
});

test('An userofficer can update topic', async () => {
  const newTopicTitle = 'new topic title';
  const topicEnabled = false;
  const topic = await mutations.updateTopic(dummyUserOfficer, {
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
  const template = await mutations.createTemplate(
    dummyUserOfficer,
    name,
    description
  );
  expect(template instanceof ProposalTemplate).toBe(true);
  expect((template as ProposalTemplate).name).toEqual(name);
  expect((template as ProposalTemplate).description).toEqual(description);
});
test('An user cannot create template', async () => {
  const name = 'The name';
  const description = 'The description';
  const template = await mutations.createTemplate(dummyUser, name, description);
  expect(template instanceof ProposalTemplate).toBe(false);
});

test('An userofficer can delete template', async () => {
  const id = 1;
  const template = await mutations.deleteTemplate(dummyUserOfficer, id);
  expect(template instanceof ProposalTemplate).toBe(true);
  expect((template as ProposalTemplate).templateId).toEqual(id);
});

test('An user can not delete template', async () => {
  const id = 1;
  const template = await mutations.deleteTemplate(dummyUser, id);
  expect(template instanceof ProposalTemplate).toBe(false);
});

test('A user can not update topic', async () => {
  const topic = await mutations.updateTopic(dummyUser, {
    id: 1,
    title: 'New topic title',
    isEnabled: false,
  });

  expect(topic instanceof Topic).toBe(false);
});

test('A user-officer can create topic', async () => {
  const response = await mutations.createTopic(dummyUserOfficer, {
    templateId: 1,
    sortOrder: 0,
  });
  expect(isRejection(response)).toBe(false);
});

test('A user can not create topic', async () => {
  const response = await mutations.createTopic(dummyUserOfficer, {
    templateId: 1,
    sortOrder: 0,
  });
  expect(isRejection(response)).toBe(false);
});

test('A user-officer can update question topic rel', async () => {
  const response = await mutations.updateQuestionsTopicRels(dummyUserOfficer, {
    templateId: 1,
    topicId: 1,
    fieldIds: ['has_links_with_industry', 'enable_crystallization'],
  });
  expect(isRejection(response)).toEqual(false);
  expect((response as string[])[0]).toEqual('has_links_with_industry');
});

test('A user can not update question topic rel', async () => {
  const response = await mutations.updateQuestionsTopicRels(dummyUser, {
    templateId: 1,
    topicId: 1,
    fieldIds: ['has_links_with_industry', 'enable_crystallization'],
  });
  expect(isRejection(response)).toEqual(true);
});

test('User can not create question', async () => {
  const response = await mutations.createQuestion(dummyUser, {
    dataType: DataType.EMBELLISHMENT,
  });
  expect(response).not.toBeInstanceOf(ProposalTemplate);
});

test('User officer can create question', async () => {
  const response = await mutations.createQuestion(dummyUserOfficer, {
    dataType: DataType.EMBELLISHMENT,
  });
  expect(response).toBeInstanceOf(Question);

  const newField = response as Question;
  expect(newField.dataType).toEqual(DataType.EMBELLISHMENT);
});

test('User can not delete question', async () => {
  await expect(
    mutations.deleteQuestion(dummyUser, 'field_id')
  ).resolves.not.toBeInstanceOf(Question);
});

test('User officer can delete question', async () => {
  await expect(
    mutations.deleteQuestion(dummyUserOfficer, 'field_id')
  ).resolves.toBeInstanceOf(Question);
});

test('Officer can update topic order', async () => {
  return expect(
    mutations.updateTopicOrder(dummyUserOfficer, [1, 3, 2])
  ).resolves.toBeTruthy();
});

test('User can not update topic order', async () => {
  const result = await mutations.updateTopicOrder(dummyUser, [1, 3, 2]);

  return expect(isRejection(result)).toBeTruthy();
});

test('Officer can delete a topic', async () => {
  const topic = await mutations.deleteTopic(dummyUserOfficer, 1);
  expect(topic instanceof Topic).toBe(true);
});

test('Dummy user can not delete a topic', async () => {
  const topic = await mutations.deleteTopic(dummyUser, 1);
  expect(topic instanceof Topic).toBe(false);
});

test('User can not update question rel', async () => {
  const steps = await mutations.updateQuestionRel(dummyUser, {
    templateId: 1,
    questionId: 'links_to_field',
    sortOrder: 2,
    topicId: 1,
  });
  expect(isRejection(steps)).toBe(true);
});

test('User officer can update question rel', async () => {
  const response = await mutations.updateQuestionRel(dummyUserOfficer, {
    templateId: 1,
    questionId: 'links_to_field',
    sortOrder: 2,
  });
  expect(isRejection(response)).toBe(false);
});

test('User can not delete question rel', async () => {
  const response = await mutations.deleteQuestionRel(dummyUser, {
    templateId: 1,
    questionId: 'links_to_field',
  });
  expect(isRejection(response)).toBe(true);
});

test('User officer can delete question rel', async () => {
  const response = await mutations.deleteQuestionRel(dummyUserOfficer, {
    templateId: 1,
    questionId: 'links_to_field',
  });
  expect(isRejection(response)).toBe(false);
});

test('User can not update proposal template', async () => {
  const steps = await mutations.updateProposalTemplate(dummyUser, {
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
  let template = await mutations.updateProposalTemplate(dummyUserOfficer, {
    templateId: 1,
    description: newDescription,
    isArchived: newIsArchived,
    name: newName,
  });
  expect(isRejection(template)).toBe(false);
  template = template as ProposalTemplate;
  expect(template.description).toEqual(newDescription);
  expect(template.isArchived).toEqual(newIsArchived);
  expect(template.name).toEqual(newName);
});

test('User can not update question template', async () => {
  const steps = await mutations.updateQuestion(dummyUser, {
    id: 'links_to_field',
    question: 'new text',
  });
  expect(isRejection(steps)).toBe(true);
});
