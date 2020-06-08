import 'reflect-metadata';
import { QuestionaryDataSourceMock } from '../datasources/mockups/QuestionaryDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyUser,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import QuestionaryQueries from '../queries/QuestionaryQueries';
import { isRejection } from '../rejection';
import { MutedLogger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import QuestionaryMutations from './QuestionaryMutations';

const dummyQuestionaryDataSource = new QuestionaryDataSourceMock();
const dummyTemplateDataSource = new TemplateDataSourceMock();
const dummyLogger = new MutedLogger();
const dummyAuth = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const mutations = new QuestionaryMutations(
  dummyQuestionaryDataSource,
  dummyTemplateDataSource,
  dummyLogger
);
const queries = new QuestionaryQueries(
  dummyQuestionaryDataSource,
  dummyTemplateDataSource,
  dummyAuth
);

const getDummyUsersProposal = async () => {
  const USER_QUESTIONARY_ID = 1;
  const steps = await queries.getQuestionarySteps(
    dummyUser,
    USER_QUESTIONARY_ID
  );
  const firstStep = steps![0];
  const firstAnswer = firstStep.fields[0];

  return { firstAnswer, firstStep, questionaryId: USER_QUESTIONARY_ID };
};

beforeEach(() => {
  dummyQuestionaryDataSource.init();
  dummyTemplateDataSource.init();
});

it('User should answer topic questions', async () => {
  const {
    firstAnswer,
    firstStep,
    questionaryId,
  } = await getDummyUsersProposal();
  const result = await mutations.answerTopic(dummyUser, {
    questionaryId,
    topicId: firstStep.topic.id,
    answers: [
      {
        questionId: firstAnswer.question.proposalQuestionId,
        value: JSON.stringify({ value: 'answer' }),
      },
    ],
  });
  expect(isRejection(result)).toBeFalsy();
});

it('User should update question', async () => {
  const NEW_ANSWER = 'NEW_ANSWER';
  const {
    firstAnswer,
    firstStep,
    questionaryId,
  } = await getDummyUsersProposal();
  const result = await mutations.updateAnswer(dummyUser, {
    questionaryId,
    answer: {
      questionId: firstAnswer.question.proposalQuestionId,
      value: NEW_ANSWER,
    },
  });
  expect(isRejection(result)).toBeFalsy();
});
