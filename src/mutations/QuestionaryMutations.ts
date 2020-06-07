import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { isMatchingConstraints } from '../models/ProposalModelFunctions';
import { User } from '../models/User';
import { rejection } from '../rejection';
import { AnswerTopicArgs } from '../resolvers/mutations/AnswerTopicMutation';
import { UpdateAnswerArgs } from '../resolvers/mutations/UpdateAnswerMutation';
import { Logger, logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class QuestionaryMutations {
  constructor(
    private dataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource,
    private logger: Logger
  ) {}

  @Authorized()
  async answerTopic(agent: User | null, args: AnswerTopicArgs) {
    const { questionaryId, topicId, answers, isPartialSave } = args;
    // TODO do authorization
    const questionary = await this.dataSource.getQuestionary(questionaryId);

    for (const answer of answers) {
      if (answer.value !== undefined) {
        const questionRel = await this.templateDataSource.getQuestionRel(
          answer.questionId,
          questionary.templateId
        );
        if (!questionRel) {
          logger.logError('Could not find questionRel', {
            questionId: answer.questionId,
            templateId: questionary.templateId,
          });

          return rejection('INTERNAL_ERROR');
        }
        if (
          !isPartialSave &&
          !isMatchingConstraints(answer.value, questionRel)
        ) {
          this.logger.logError('User provided value not matching constraint', {
            answer,
            templateField: questionRel,
          });

          return rejection('VALUE_CONSTRAINT_REJECTION');
        }
        await this.dataSource.updateAnswer(
          questionaryId,
          answer.questionId,
          answer.value
        );
      }
    }
    if (!isPartialSave) {
      await this.dataSource.updateTopicCompletenes(
        questionaryId,
        topicId,
        true
      );
    }

    return (await this.dataSource.getQuestionarySteps(questionaryId)).filter(
      step => step.topic.id === topicId
    );
  }

  @Authorized()
  async updateAnswer(agent: User | null, args: UpdateAnswerArgs) {
    // TODO do authorization
    return this.dataSource.updateAnswer(
      args.questionaryId,
      args.answer.questionId,
      args.answer.value
    );
  }
}
