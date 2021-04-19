import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { Authorized } from '../decorators';
import { Questionary, QuestionaryStep } from '../models/Questionary';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { QuestionaryAuthorization } from '../utils/QuestionaryAuthorization';

@injectable()
export default class QuestionaryQueries {
  constructor(
    @inject(Tokens.QuestionaryDataSource)
    public dataSource: QuestionaryDataSource,
    @inject(Tokens.QuestionaryAuthorization)
    private authorizer: QuestionaryAuthorization
  ) {}

  @Authorized()
  async getQuestionary(
    agent: UserWithRole | null,
    questionaryId: number
  ): Promise<Questionary | null> {
    const hasRights = await this.authorizer.hasReadRights(agent, questionaryId);
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
  async getQuestionarySteps(
    agent: UserWithRole | null,
    questionaryId: number
  ): Promise<QuestionaryStep[] | null> {
    const hasRights = await this.authorizer.hasReadRights(agent, questionaryId);
    if (!hasRights) {
      logger.logWarn('Permissions violated trying to access steps', {
        email: agent?.email,
        questionaryId,
      });

      return null;
    }

    return this.dataSource.getQuestionarySteps(questionaryId);
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  getCount(user: UserWithRole | null, templateId: number): Promise<number> {
    return this.dataSource.getCount(templateId);
  }

  @Authorized()
  async isCompleted(agent: UserWithRole | null, questionaryId: number) {
    const hasRights = await this.authorizer.hasReadRights(agent, questionaryId);
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
}
