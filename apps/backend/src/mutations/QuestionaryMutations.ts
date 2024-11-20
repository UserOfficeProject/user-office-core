import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { container, inject, injectable } from 'tsyringe';

import { QuestionaryAuthorization } from '../auth/QuestionaryAuthorization';
import { Tokens } from '../config/Tokens';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized, EventBus } from '../decorators';
import { Event } from '../events/event.enum';
import {
  isMatchingConstraints,
  transformAnswerValueIfNeeded,
} from '../models/ProposalModelFunctions';
import { AnswerBasic } from '../models/Questionary';
import { getQuestionDefinition } from '../models/questionTypes/QuestionRegistry';
import { rejection } from '../models/Rejection';
import { UserJWT, UserWithRole } from '../models/User';
import { AnswerTopicArgs } from '../resolvers/mutations/AnswerTopicMutation';
import { CreateQuestionaryArgs } from '../resolvers/mutations/CreateQuestionaryMutation';
import { UpdateAnswerArgs } from '../resolvers/mutations/UpdateAnswerMutation';

@injectable()
export default class QuestionaryMutations {
  private questionaryAuth = container.resolve(QuestionaryAuthorization);

  constructor(
    @inject(Tokens.QuestionaryDataSource)
    private dataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource
  ) {}

  async deleteOldAnswers(
    templateId: number,
    questionaryId: number,
    topicId: number
  ) {
    const templateSteps =
      await this.templateDataSource.getTemplateSteps(templateId);
    const stepQuestions = templateSteps.find(
      (step) => step.topic.id === topicId
    )?.fields;
    if (stepQuestions === undefined) {
      logger.logError('Expected to find step, but was not found', {
        templateId,
        questionaryId,
        topicId,
      });
      throw new GraphQLError('Expected to find step, but was not found');
    }

    const questionIds: string[] = stepQuestions.map(
      (question) => question.question.id
    );
    await this.dataSource.deleteAnswers(questionaryId, questionIds);
  }

  @Authorized()
  @EventBus(Event.TOPIC_ANSWERED)
  async answerTopic(agent: UserWithRole | null, args: AnswerTopicArgs) {
    const { questionaryId, topicId, answers, isPartialSave } = args;

    const questionary = await this.dataSource.getQuestionary(questionaryId);
    if (!questionary) {
      return rejection(
        'Can not answer topic because questionary does not exist',
        { questionaryId }
      );
    }
    const template = await this.templateDataSource.getTemplate(
      questionary.templateId
    );
    if (!template) {
      return rejection(
        'Can not answer questionary because the template is missing',
        { questionary }
      );
    }

    const hasRights = await this.questionaryAuth.hasWriteRights(
      agent,
      questionaryId
    );
    if (!hasRights) {
      return rejection(
        'Can not answer topic because of insufficient permissions',
        { agent, args }
      );
    }

    await this.deleteOldAnswers(template.templateId, questionaryId, topicId);
    const updatedAnswers: AnswerBasic[] = [];

    for (const answer of answers) {
      if (answer.value !== undefined) {
        const questionTemplateRelation =
          await this.templateDataSource.getQuestionTemplateRelation(
            answer.questionId,
            questionary.templateId
          );
        if (!questionTemplateRelation) {
          return rejection(
            'Can not answer topic because could not find QuestionTemplateRelation',
            {
              questionId: answer.questionId,
              templateId: questionary.templateId,
            }
          );
        }
        const { value, ...parsedAnswerRest } = JSON.parse(answer.value);
        if (
          !isPartialSave &&
          !(await isMatchingConstraints(questionTemplateRelation, value))
        ) {
          return rejection(
            'The input to "' +
              questionTemplateRelation.question.question +
              '" is not satisfying a constraint. Please enter a valid input.',
            { answer, questionTemplateRelation }
          );
        }

        const transformedValue = transformAnswerValueIfNeeded(
          questionTemplateRelation,
          value
        );
        if (transformedValue !== undefined) {
          answer.value = JSON.stringify({
            value: transformedValue,
            ...parsedAnswerRest,
          });
        }

        const definition = getQuestionDefinition(
          questionTemplateRelation.question.dataType
        );

        if (definition.onBeforeSave) {
          definition.onBeforeSave(
            questionaryId,
            questionTemplateRelation,
            answer
          );
        }

        await this.dataSource.updateAnswer(
          questionaryId,
          answer.questionId,
          answer.value
        );

        updatedAnswers.push(
          (await this.dataSource.getAnswer(
            questionaryId,
            questionTemplateRelation.question.naturalKey
          ))!
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

    return updatedAnswers;
  }

  @Authorized()
  async updateAnswer(agent: UserJWT | null, args: UpdateAnswerArgs) {
    const hasRights = await this.questionaryAuth.hasWriteRights(
      agent,
      args.questionaryId
    );
    if (!hasRights) {
      return rejection(
        'Can not update answer because of insufficient permissions',
        { args, agent }
      );
    }

    return this.dataSource
      .updateAnswer(
        args.questionaryId,
        args.answer.questionId,
        args.answer.value
      )
      .catch((error) => {
        return rejection('Failed to update answer', { args }, error);
      });
  }

  @Authorized()
  async create(agent: UserJWT | null, args: CreateQuestionaryArgs) {
    return this.dataSource.create(agent!.id, args.templateId).catch((error) => {
      return rejection('Failed to create questionary', { args }, error);
    });
  }
}
