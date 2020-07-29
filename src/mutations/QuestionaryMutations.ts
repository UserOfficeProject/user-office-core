import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { isMatchingConstraints } from '../models/ProposalModelFunctions';
import { User } from '../models/User';
import { rejection } from '../rejection';
import { AnswerTopicArgs } from '../resolvers/mutations/AnswerTopicMutation';
import { CreateQuestionaryArgs } from '../resolvers/mutations/CreateQuestionaryMutation';
import { UpdateAnswerArgs } from '../resolvers/mutations/UpdateAnswerMutation';
import { Logger, logger } from '../utils/Logger';
import { QuestionaryAuthorization } from '../utils/QuestionaryAuthorization';
import { CreateAnswerQuestionaryRelationsArgs } from '../resolvers/mutations/CreateAnswerQuestionaryRelationsMutation';

export default class QuestionaryMutations {
  constructor(
    private dataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource,
    private questionaryAuth: QuestionaryAuthorization,
    private logger: Logger
  ) {}

  @Authorized()
  async answerTopic(agent: User | null, args: AnswerTopicArgs) {
    const { questionaryId, topicId, answers, isPartialSave } = args;

    const questionary = await this.dataSource.getQuestionary(questionaryId);
    if (!questionary) {
      logger.logError('Trying to answer non-existing questionary', {
        questionaryId,
      });

      return rejection('NOT_FOUND');
    }
    const template = await this.templateDataSource.getTemplate(
      questionary.templateId
    );
    if (!template) {
      logger.logError('Trying to answer questionary without template', {
        templateId: questionary.templateId,
      });

      return rejection('NOT_FOUND');
    }

    const hasRights = await this.questionaryAuth.hasWriteRights(
      agent,
      questionaryId
    );
    if (!hasRights) {
      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    for (const answer of answers) {
      if (answer.value !== undefined) {
        const questionTemplateRelation = await this.templateDataSource.getQuestionTemplateRelation(
          answer.questionId,
          questionary.templateId
        );
        if (!questionTemplateRelation) {
          logger.logError('Could not find questionTemplateRelation', {
            questionId: answer.questionId,
            templateId: questionary.templateId,
          });

          return rejection('INTERNAL_ERROR');
        }
        if (
          !isPartialSave &&
          !isMatchingConstraints(answer.value, questionTemplateRelation)
        ) {
          this.logger.logError('User provided value not matching constraint', {
            answer,
            questionTemplateRelation,
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
      await this.dataSource.updateTopicCompleteness(
        questionaryId,
        topicId,
        true
      );
    }

    return (await this.dataSource.getQuestionarySteps(questionaryId)).find(
      step => step.topic.id === topicId
    )!;
  }

  @Authorized()
  async updateAnswer(agent: User | null, args: UpdateAnswerArgs) {
    const hasRights = await this.questionaryAuth.hasWriteRights(
      agent,
      args.questionaryId
    );
    if (!hasRights) {
      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    return this.dataSource.updateAnswer(
      args.questionaryId,
      args.answer.questionId,
      args.answer.value
    );
  }

  @Authorized()
  async create(agent: User | null, args: CreateQuestionaryArgs) {
    return this.dataSource.create(agent!.id, args.templateId);
  }

  async createAnswerQuestionaryRelation(
    agent: User | null,
    args: CreateAnswerQuestionaryRelationsArgs
  ) {
    // TODO perform authorization
    await this.dataSource.deleteAnswerQuestionaryRelations(args.answerId);
    return this.dataSource.createAnswerQuestionaryRelations(
      args.answerId,
      args.questionaryIds
    );
  }
}
