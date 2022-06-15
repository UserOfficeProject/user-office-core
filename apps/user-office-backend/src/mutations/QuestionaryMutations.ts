import { logger } from '@user-office-software/duo-logger';
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
import { rejection } from '../models/Rejection';
import { User, UserWithRole } from '../models/User';
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
    const templateSteps = await this.templateDataSource.getTemplateSteps(
      templateId
    );
    const stepQuestions = templateSteps.find(
      (step) => step.topic.id === topicId
    )?.fields;
    if (stepQuestions === undefined) {
      logger.logError('Expected to find step, but was not found', {
        templateId,
        questionaryId,
        topicId,
      });
      throw new Error('Expected to find step, but was not found');
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
            'Can not answer topic because provided value is not satisfying constraint',
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
      (step) => step.topic.id === topicId
    )!;
  }

  @Authorized()
  async updateAnswer(agent: User | null, args: UpdateAnswerArgs) {
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
  async create(agent: User | null, args: CreateQuestionaryArgs) {
    return this.dataSource.create(agent!.id, args.templateId).catch((error) => {
      return rejection('Failed to create questionary', { args }, error);
    });
  }
}
