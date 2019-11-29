import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { isRejection } from "../rejection";
import {
  Topic,
  ProposalTemplate,
  DataType,
  ProposalTemplateField
} from "../models/ProposalModel";
import { UserAuthorization } from "../utils/UserAuthorization";
import { MutedLogger } from "../utils/Logger";
import {
  dummyUserOfficer,
  dummyUser,
  userDataSource
} from "../datasources/mockups/UserDataSource";
import { templateDataSource } from "../datasources/mockups/TemplateDataSource";
import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";
import TemplateMutations from "./TemplateMutations";

// TODO: it is here much of the logic reside

const dummyLogger = new MutedLogger();
const dummyEventBus = new EventBus<ApplicationEvent>();
const dummyTemplateDataSource = new templateDataSource();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new reviewDataSource()
);
const templateMutations = new TemplateMutations(
  dummyTemplateDataSource,
  userAuthorization,
  dummyEventBus,
  dummyLogger
);

beforeEach(() => {
  dummyTemplateDataSource.init();
});

test("A userofficer can update topic", async () => {
  const newTopicTitle = "new topic title";
  const topicEnabled = false;
  const topic = await templateMutations.updateTopic(
    dummyUserOfficer,
    1,
    newTopicTitle,
    topicEnabled
  );
  expect(topic instanceof Topic).toBe(true);
  expect((topic as Topic).topic_title).toEqual(newTopicTitle);
  expect((topic as Topic).is_enabled).toEqual(topicEnabled);
});

test("A user can not update topic", async () => {
  const topic = await templateMutations.updateTopic(
    dummyUser,
    1,
    "New topic title",
    false
  );

  expect(topic instanceof Topic).toBe(false);
});

test("A userofficer can create topic", async () => {
  let template = await templateMutations.createTopic(dummyUserOfficer, 0);
  expect(template instanceof ProposalTemplate).toBe(true); // getting back new template
  var numbefOfTopics = (template as ProposalTemplate).steps.length;

  template = await templateMutations.createTopic(dummyUserOfficer, 1);
  expect((template as ProposalTemplate).steps.length).toEqual(
    numbefOfTopics + 1
  ); // added new one
});

test("A user can not create topic", async () => {
  const topic = await templateMutations.createTopic(dummyUser, 0);
  expect(topic instanceof ProposalTemplate).toBe(false);
});

test("A userofficer can update fieltTopicRel", async () => {
  const response = await templateMutations.updateFieldTopicRel(
    dummyUserOfficer,
    1,
    ["has_links_with_industry", "enable_crystallization"]
  );
  expect(isRejection(response)).toEqual(false);
});

test("A user can not update fieltTopicRel", async () => {
  const response = await templateMutations.updateFieldTopicRel(dummyUser, 1, [
    "has_links_with_industry",
    "enable_crystallization"
  ]);
  expect(isRejection(response)).toEqual(true);
});

test("User can not create field", async () => {
  const response = await templateMutations.createTemplateField(
    dummyUser,
    1,
    DataType.EMBELLISHMENT
  );
  expect(response).not.toBeInstanceOf(ProposalTemplate);
});

test("User officer can create field", async () => {
  const response = await templateMutations.createTemplateField(
    dummyUserOfficer,
    1,
    DataType.EMBELLISHMENT
  );
  expect(response).toBeInstanceOf(ProposalTemplateField);

  const newField = response as ProposalTemplateField;
  expect(newField.topic_id).toEqual(1);
  expect(newField.data_type).toEqual(DataType.EMBELLISHMENT);
});

test("User can not delete field", async () => {
  expect(
    templateMutations.deleteTemplateField(dummyUser, "field_id")
  ).resolves.not.toBeInstanceOf(ProposalTemplate);
});

test("User officer can delete field", async () => {
  expect(
    templateMutations.deleteTemplateField(dummyUserOfficer, "field_id")
  ).resolves.toBeInstanceOf(ProposalTemplate);
});

test("Officer can update topic order", async () => {
  return expect(
    templateMutations.updateTopicOrder(dummyUserOfficer, [1, 3, 2])
  ).resolves.toBeTruthy();
});

test("User can not update topic order", async () => {
  const result = await templateMutations.updateTopicOrder(dummyUser, [1, 3, 2]);
  return expect(isRejection(result)).toBeTruthy();
});

test("Officer can delete a topic", async () => {
  expect(templateMutations.deleteTopic(dummyUser, 1)).resolves.toBeInstanceOf(
    Topic
  );
});

test("Dummy user can't delete a topic", async () => {
  expect(
    templateMutations.deleteTopic(dummyUser, 1)
  ).resolves.not.toBeInstanceOf(Topic);
});
