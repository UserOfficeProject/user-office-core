import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { isRejection } from '../models/Rejection';
import {
  Template,
  Topic,
  TemplateCategoryId,
  DataType,
  Question,
  TemplateGroupId,
} from '../models/Template';
import TemplateMutations from './TemplateMutations';

const QUESTION_ID = 'links_to_field';
const NON_EXISTING_QUESTION_ID = 'non_existing_question_id';

const mutations = container.resolve(TemplateMutations);

beforeEach(() => {
  container.resolve<TemplateDataSourceMock>(Tokens.TemplateDataSource).init();
});

test('An userofficer can update topic', async () => {
  const newTopicTitle = 'new topic title';
  const topicEnabled = false;
  const result = await mutations.updateTopic(dummyUserOfficerWithRole, {
    id: 1,
    templateId: 1,
    title: newTopicTitle,
    isEnabled: topicEnabled,
    sortOrder: 0,
  });

  expect(isRejection(result)).toBeFalsy();

  const template = result as Template;
  expect(template instanceof Template).toBe(true);
});

test('An userofficer can create template', async () => {
  const name = 'The name';
  const description = 'The description';
  const groupId = TemplateGroupId.PROPOSAL;
  const template = await mutations.createTemplate(dummyUserOfficerWithRole, {
    groupId,
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
  const groupId = TemplateGroupId.PROPOSAL;
  const template = await mutations.createTemplate(dummyUserWithRole, {
    groupId,
    name,
    description,
  });
  expect(template instanceof Template).toBe(false);
});

test('An userofficer can delete template', async () => {
  const templateId = 1;
  const template = await mutations.deleteTemplate(dummyUserOfficerWithRole, {
    templateId,
  });
  expect(template instanceof Template).toBe(true);
  expect((template as Template).templateId).toEqual(templateId);
});

test('An user can not delete template', async () => {
  const templateId = 1;
  const template = await mutations.deleteTemplate(dummyUserWithRole, {
    templateId,
  });
  expect(template instanceof Template).toBe(false);
});

test('Can not delete non-existing template', async () => {
  const result = await mutations.deleteTemplate(dummyUserOfficerWithRole, {
    templateId: 9,
  });
  expect(isRejection(result)).toBeTruthy();
});

test('A user can not update topic', async () => {
  const topic = await mutations.updateTopic(dummyUserWithRole, {
    id: 1,
    templateId: 1,
    title: 'New topic title',
    isEnabled: false,
    sortOrder: 0,
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

test('User can not create question', async () => {
  const response = await mutations.createQuestion(dummyUserWithRole, {
    categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
    dataType: DataType.EMBELLISHMENT,
  });
  expect(response).not.toBeInstanceOf(Template);
});

test('User officer can create question', async () => {
  const response = await mutations.createQuestion(dummyUserOfficerWithRole, {
    categoryId: TemplateCategoryId.PROPOSAL_QUESTIONARY,
    dataType: DataType.EMBELLISHMENT,
  });
  expect(response).toBeInstanceOf(Question);

  const newField = response as Question;
  expect(newField.dataType).toEqual(DataType.EMBELLISHMENT);
});

test('User can not delete question', async () => {
  await expect(
    mutations.deleteQuestion(dummyUserWithRole, { questionId: QUESTION_ID })
  ).resolves.not.toBeInstanceOf(Question);
});

test('User officer can delete question', async () => {
  await expect(
    mutations.deleteQuestion(dummyUserOfficerWithRole, {
      questionId: QUESTION_ID,
    })
  ).resolves.toBeInstanceOf(Question);
});

test('Can not delete non-existing question', async () => {
  const result = await mutations.deleteQuestion(dummyUserOfficerWithRole, {
    questionId: NON_EXISTING_QUESTION_ID,
  });
  await expect(isRejection(result)).toBeTruthy();
});

test('User can not delete a topic', async () => {
  const topic = await mutations.deleteTopic(dummyUserWithRole, { topicId: 1 });
  expect(topic instanceof Topic).toBe(false);
});

test('User can not update question rel', async () => {
  const steps = await mutations.updateQuestionTemplateRelation(
    dummyUserWithRole,
    {
      templateId: 1,
      questionId: QUESTION_ID,
      sortOrder: 0,
      topicId: 1,
    }
  );
  expect(isRejection(steps)).toBe(true);
});

test('User officer can update question rel', async () => {
  const response = await mutations.updateQuestionTemplateRelation(
    dummyUserOfficerWithRole,
    {
      templateId: 1,
      questionId: QUESTION_ID,
      sortOrder: 0,
    }
  );
  expect(isRejection(response)).toBe(false);
});

test('User can not delete question rel', async () => {
  const response = await mutations.deleteQuestionTemplateRelation(
    dummyUserWithRole,
    {
      templateId: 1,
      questionId: QUESTION_ID,
    }
  );
  expect(isRejection(response)).toBe(true);
});

test('User officer can delete question rel', async () => {
  const response = await mutations.deleteQuestionTemplateRelation(
    dummyUserOfficerWithRole,
    {
      templateId: 1,
      questionId: QUESTION_ID,
    }
  );
  expect(isRejection(response)).toBe(false);
});

test('User can not update proposal template', async () => {
  const steps = await mutations.updateTemplate(dummyUserWithRole, {
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
  let template = await mutations.updateTemplate(dummyUserOfficerWithRole, {
    templateId: 1,
    description: newDescription,
    isArchived: newIsArchived,
    name: newName,
  });
  expect(isRejection(template)).toBe(false);
  template = template as Template;
  expect(template.description).toEqual(newDescription);
  expect(template.isArchived).toEqual(newIsArchived);
  expect(template.name).toEqual(newName);
});

test('User can not update question template', async () => {
  const steps = await mutations.updateQuestion(dummyUserWithRole, {
    id: QUESTION_ID,
    question: 'new text',
  });
  expect(isRejection(steps)).toBe(true);
});

test('User officer can clone template', async () => {
  const clonedTemplate = await mutations.cloneTemplate(
    dummyUserOfficerWithRole,
    {
      templateId: 1,
    }
  );
  expect(clonedTemplate.templateId).toBeGreaterThan(0);
});

test('User officer can add question to template', async () => {
  const questionId = 'questionId';
  const sortOrder = 0;
  const templateId = 1;
  const topicId = 1;

  const result = await mutations.createQuestionTemplateRelation(
    dummyUserOfficerWithRole,
    {
      questionId,
      sortOrder,
      templateId,
      topicId,
    }
  );

  expect(isRejection(result)).toBeFalsy();
  expect(result).toBeInstanceOf(Template);
});

test('User officer can update question', async () => {
  const NEW_QUESTION_TEXT = 'new question';
  const result = await mutations.updateQuestion(dummyUserOfficerWithRole, {
    id: QUESTION_ID,
    question: NEW_QUESTION_TEXT,
  });
  expect(isRejection(result)).toBeFalsy();
  const updatedQuestion = result as Question;
  expect(updatedQuestion.question).toBe(NEW_QUESTION_TEXT);
});

test('User can not update question', async () => {
  const result = await mutations.updateQuestion(dummyUserWithRole, {
    id: QUESTION_ID,
    question: '',
  });
  expect(isRejection(result)).toBeTruthy();
});

test('Updating non existing question should result error', async () => {
  const result = await mutations.updateQuestion(dummyUserOfficerWithRole, {
    id: NON_EXISTING_QUESTION_ID,
    question: '',
  });
  expect(isRejection(result)).toBeTruthy();
});
