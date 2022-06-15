import { logger } from '@user-office-software/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { QuestionaryAuthorization } from '../auth/QuestionaryAuthorization';
import { Tokens } from '../config/Tokens';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { Authorized } from '../decorators';
import { Questionary, QuestionaryStep } from '../models/Questionary';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { TemplateCategoryId } from './../models/Template';

@injectable()
export default class QuestionaryQueries {
  private questionaryAuth = container.resolve(QuestionaryAuthorization);

  constructor(
    @inject(Tokens.QuestionaryDataSource)
    public dataSource: QuestionaryDataSource
  ) {}

  @Authorized()
  async getQuestionary(
    agent: UserWithRole | null,
    questionaryId: number
  ): Promise<Questionary | null> {
    const hasRights = await this.questionaryAuth.hasReadRights(
      agent,
      questionaryId
    );
    if (!hasRights) {
      logger.logWarn('Permissions violated trying to access questionary', {
        email: agent?.email,
        questionaryId,
      });

      return null;
    }

    return this.dataSource.getQuestionary(questionaryId);
  }

  @Authorized()
  async getBlankQuestionary(
    agent: UserWithRole | null,
    templateId: number
  ): Promise<Questionary> {
    return {
      questionaryId: 0,
      templateId: templateId,
      creatorId: agent!.id,
      created: new Date(),
    };
  }

  /**
   * @deprecated  Use getBlankQuestionary instead {@link #getBlankQuestionary()}
   */
  @Authorized()
  async getQuestionaryOrDefault(
    agent: UserWithRole | null,
    questionaryId: number,
    templateCategory: TemplateCategoryId
  ): Promise<Questionary> {
    const questionary = await this.dataSource.getQuestionary(questionaryId);

    if (questionary) {
      return questionary;
    }

    return {
      questionaryId: 0,
      templateId: templateCategory,
      creatorId: agent!.id,
      created: new Date(),
    };
  }

  @Authorized()
  async getQuestionarySteps(
    agent: UserWithRole | null,
    questionaryId: number
  ): Promise<QuestionaryStep[] | null> {
    const hasRights = await this.questionaryAuth.hasReadRights(
      agent,
      questionaryId
    );
    if (!hasRights) {
      logger.logWarn('Permissions violated trying to access steps', {
        email: agent?.email,
        questionaryId,
      });

      return null;
    }

    const q = await this.dataSource.getQuestionarySteps(questionaryId);

    return this.dataSource.getQuestionarySteps(questionaryId);
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  getCount(user: UserWithRole | null, templateId: number): Promise<number> {
    return this.dataSource.getCount(templateId);
  }

  @Authorized()
  async isCompleted(agent: UserWithRole | null, questionaryId: number) {
    const hasRights = await this.questionaryAuth.hasReadRights(
      agent,
      questionaryId
    );
    if (!hasRights) {
      logger.logWarn('Permissions violated trying to access isComplete', {
        email: agent?.email,
        questionaryId,
      });

      return false;
    }

    return this.dataSource.getIsCompleted(questionaryId);
  }

  async getBlankQuestionarySteps(
    agent: UserWithRole | null,
    templateId: number
  ): Promise<QuestionaryStep[]> {
    return this.dataSource.getBlankQuestionarySteps(templateId);
  }

  async getQuestionaryStepsOrDefault(
    agent: UserWithRole | null,
    questionaryId: number,
    templateId: TemplateCategoryId
  ): Promise<QuestionaryStep[]> {
    const steps = await this.getQuestionarySteps(agent, questionaryId);

    if (steps) {
      return steps;
    }

    return this.getBlankQuestionarySteps(agent, templateId);
  }
}
