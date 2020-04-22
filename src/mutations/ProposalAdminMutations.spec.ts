import 'reflect-metadata';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficer,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import { dummyUser } from '../datasources/mockups/UserDataSource';
import { DataType, ProposalTemplate, Topic } from '../models/ProposalModel';
import { ProposalTemplateMetadata, Question } from '../models/ProposalModel';
import { isRejection } from '../rejection';
import { MutedLogger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import ProposalAdminMutations from './ProposalAdminMutations';

const dummyLogger = new MutedLogger();
const dummyTemplateDataSource = new TemplateDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const mutations = new ProposalAdminMutations(
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
  expect((topic as Topic).topic_title).toEqual(newTopicTitle);
  expect((topic as Topic).is_enabled).toEqual(topicEnabled);
});

test('An userofficer can create template', async () => {
  const name = 'The name';
  const description = 'The description';
  const templateMetadata = await mutations.createTemplate(
    dummyUserOfficer,
    name,
    description
  );
  expect(templateMetadata instanceof ProposalTemplateMetadata).toBe(true);
  expect((templateMetadata as ProposalTemplateMetadata).name).toEqual(name);
  expect((templateMetadata as ProposalTemplateMetadata).description).toEqual(
    description
  );
});
test('An user cannot create template', async () => {
  const name = 'The name';
  const description = 'The description';
  const templateMetadata = await mutations.createTemplate(
    dummyUser,
    name,
    description
  );
  expect(templateMetadata instanceof ProposalTemplateMetadata).toBe(false);
});

test('An userofficer can delete template', async () => {
  const id = 1;
  const templateMetadata = await mutations.deleteTemplate(dummyUserOfficer, id);
  expect(templateMetadata instanceof ProposalTemplateMetadata).toBe(true);
  expect((templateMetadata as ProposalTemplateMetadata).templateId).toEqual(id);
});

test('An user can not delete template', async () => {
  const id = 1;
  const templateMetadata = await mutations.deleteTemplate(dummyUser, id);
  expect(templateMetadata instanceof ProposalTemplateMetadata).toBe(false);
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
  let template = await mutations.createTopic(dummyUserOfficer, {
    templateId: 1,
    sortOrder: 0,
  });
  expect(template instanceof ProposalTemplate).toBe(true); // getting back new template
  const numberOfTopics = (template as ProposalTemplate).steps.length;

  template = await mutations.createTopic(dummyUserOfficer, {
    templateId: 1,
    sortOrder: 1,
  });
  expect((template as ProposalTemplate).steps.length).toEqual(
    numberOfTopics + 1
  ); // added new one
});

test('A user can not create topic', async () => {
  const topic = await mutations.createTopic(dummyUser, {
    templateId: 1,
    sortOrder: 0,
  });
  expect(topic instanceof ProposalTemplate).toBe(false);
});

test('A user-officer can update fieltTopicRel', async () => {
  const response = await mutations.updateFieldTopicRel(dummyUserOfficer, {
    templateId: 1,
    topicId: 1,
    fieldIds: ['has_links_with_industry', 'enable_crystallization'],
  });
  expect(isRejection(response)).toEqual(false);
});

test('A user can not update fieltTopicRel', async () => {
  const response = await mutations.updateFieldTopicRel(dummyUser, {
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
