import 'reflect-metadata';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficer,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import { DataType, ProposalTemplate, Topic } from '../models/ProposalModel';
import { isRejection } from '../rejection';
import { MutedLogger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import { dummyUser } from './../datasources/mockups/UserDataSource';
import { ProposalTemplateMetadata, Question } from './../models/ProposalModel';
import TemplateMutations from './TemplateMutations';

// TODO: it is here much of the logic reside

const dummyLogger = new MutedLogger();
const dummyTemplateDataSource = new TemplateDataSourceMock();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const templateMutations = new TemplateMutations(
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
  const topic = await templateMutations.updateTopic(dummyUserOfficer, {
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
  const templateMetadata = await templateMutations.createTemplate(
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
  const templateMetadata = await templateMutations.createTemplate(
    dummyUser,
    name,
    description
  );
  expect(templateMetadata instanceof ProposalTemplateMetadata).toBe(false);
});

test('An userofficer can delete template', async () => {
  const id = 1;
  const templateMetadata = await templateMutations.deleteTemplate(
    dummyUserOfficer,
    id
  );
  expect(templateMetadata instanceof ProposalTemplateMetadata).toBe(true);
  expect((templateMetadata as ProposalTemplateMetadata).templateId).toEqual(id);
});

test('An user can not delete template', async () => {
  const id = 1;
  const templateMetadata = await templateMutations.deleteTemplate(
    dummyUser,
    id
  );
  expect(templateMetadata instanceof ProposalTemplateMetadata).toBe(false);
});

test('A user can not update topic', async () => {
  const topic = await templateMutations.updateTopic(dummyUser, {
    id: 1,
    title: 'New topic title',
    isEnabled: false,
  });

  expect(topic instanceof Topic).toBe(false);
});

test('A user-officer can create topic', async () => {
  let template = await templateMutations.createTopic(dummyUserOfficer, 1, 0);
  expect(template instanceof ProposalTemplate).toBe(true); // getting back new template
  const numberOfTopics = (template as ProposalTemplate).steps.length;

  template = await templateMutations.createTopic(dummyUserOfficer, 1, 1);
  expect((template as ProposalTemplate).steps.length).toEqual(
    numberOfTopics + 1
  ); // added new one
});

test('A user can not create topic', async () => {
  const topic = await templateMutations.createTopic(dummyUser, 1, 0);
  expect(topic instanceof ProposalTemplate).toBe(false);
});

test('A user-officer can update fieltTopicRel', async () => {
  const response = await templateMutations.updateFieldTopicRel(
    dummyUserOfficer,
    {
      templateId: 1,
      topicId: 1,
      fieldIds: ['has_links_with_industry', 'enable_crystallization'],
    }
  );
  expect(isRejection(response)).toEqual(false);
});

test('A user can not update fieltTopicRel', async () => {
  const response = await templateMutations.updateFieldTopicRel(dummyUser, {
    templateId: 1,
    topicId: 1,
    fieldIds: ['has_links_with_industry', 'enable_crystallization'],
  });
  expect(isRejection(response)).toEqual(true);
});

test('User can not create field', async () => {
  const response = await templateMutations.createQuestion(dummyUser, {
    dataType: DataType.EMBELLISHMENT,
  });
  expect(response).not.toBeInstanceOf(ProposalTemplate);
});

test('User officer can create field', async () => {
  const response = await templateMutations.createQuestion(dummyUserOfficer, {
    dataType: DataType.EMBELLISHMENT,
  });
  expect(response).toBeInstanceOf(Question);

  const newField = response as Question;
  expect(newField.dataType).toEqual(DataType.EMBELLISHMENT);
});

test('User can not delete field', async () => {
  await expect(
    templateMutations.deleteQuestion(dummyUser, 'field_id')
  ).resolves.not.toBeInstanceOf(Question);
});

test('User officer can delete field', async () => {
  await expect(
    templateMutations.deleteQuestion(dummyUserOfficer, 'field_id')
  ).resolves.toBeInstanceOf(Question);
});

test('Officer can update topic order', async () => {
  return expect(
    templateMutations.updateTopicOrder(dummyUserOfficer, [1, 3, 2])
  ).resolves.toBeTruthy();
});

test('User can not update topic order', async () => {
  const result = await templateMutations.updateTopicOrder(dummyUser, [1, 3, 2]);

  return expect(isRejection(result)).toBeTruthy();
});

test('Officer can delete a topic', async () => {
  const topic = await templateMutations.deleteTopic(dummyUserOfficer, 1);
  expect(topic instanceof Topic).toBe(true);
});

test('Dummy user can not delete a topic', async () => {
  const topic = await templateMutations.deleteTopic(dummyUser, 1);
  expect(topic instanceof Topic).toBe(false);
});
