import 'reflect-metadata';
import { container } from 'tsyringe';

import QuestionaryMutations from './QuestionaryMutations';
import { Tokens } from '../config/Tokens';
import {
  QuestionaryDataSourceMock,
  dummyQuestionTemplateRelationFactory,
} from '../datasources/mockups/QuestionaryDataSource';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { isRejection } from '../models/Rejection';
import QuestionaryQueries from '../queries/QuestionaryQueries';

const mutations = container.resolve(QuestionaryMutations);
const queries = container.resolve(QuestionaryQueries);
const templateDataSource = container.resolve<TemplateDataSource>(
  Tokens.TemplateDataSource
);

const USER_QUESTIONARY_ID = 1;

const getDummyUsersProposal = async () => {
  const steps = await queries.getQuestionarySteps(
    dummyUserWithRole,
    USER_QUESTIONARY_ID
  );
  const firstStep = steps![0];
  const firstAnswer = firstStep.fields[0];

  return { firstAnswer, firstStep, questionaryId: USER_QUESTIONARY_ID };
};

beforeEach(() => {
  container
    .resolve<QuestionaryDataSourceMock>(Tokens.QuestionaryDataSource)
    .init();
});

it('User should answer topic questions', async () => {
  jest
    .spyOn(templateDataSource, 'getQuestionTemplateRelation')
    .mockResolvedValue(dummyQuestionTemplateRelationFactory());
  const { firstAnswer, firstStep, questionaryId } =
    await getDummyUsersProposal();
  const result = await mutations.answerTopic(dummyUserWithRole, {
    questionaryId,
    topicId: firstStep.topic.id,
    answers: [
      {
        questionId: firstAnswer.question.id,
        value: JSON.stringify({ value: 'answer' }),
      },
    ],
  });
  expect(isRejection(result)).toBeFalsy();
});

it('User should not be able to answer topic questions if proposal has no active call', async () => {
  const { firstAnswer, firstStep, questionaryId } =
    await getDummyUsersProposal();
  const result = await mutations.answerTopic(dummyUserWithRole, {
    questionaryId: questionaryId + 1, // anything other than 1 is considered to have no active call
    topicId: firstStep.topic.id,
    answers: [
      {
        questionId: firstAnswer.question.id,
        value: JSON.stringify({ value: 'answer' }),
      },
    ],
  });
  expect(isRejection(result)).toBe(true);
});

it('User should update question', async () => {
  const NEW_ANSWER = 'NEW_ANSWER';
  const { firstAnswer, questionaryId } = await getDummyUsersProposal();
  const result = await mutations.updateAnswer(dummyUserWithRole, {
    questionaryId,
    answer: {
      questionId: firstAnswer.question.id,
      value: NEW_ANSWER,
    },
  });
  expect(isRejection(result)).toBeFalsy();
});
