import { logger } from '@user-office-software/duo-logger';
import jp from 'jsonpath';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { Question, TemplateGroupId, TemplateStep } from '../models/Template';
import { UserWithRole } from '../models/User';
import {
  AllQuestionsFilterArgs,
  QuestionsFilter,
} from '../resolvers/queries/QuestionsQuery';
import { TemplatesArgs } from '../resolvers/queries/TemplatesQuery';
import { DynamicMultipleChoiceConfig } from '../resolvers/types/FieldConfig';

@injectable()
export default class TemplateQueries {
  constructor(
    @inject(Tokens.TemplateDataSource) private dataSource: TemplateDataSource
  ) {}

  @Authorized()
  async getTemplate(agent: UserWithRole | null, templateId: number) {
    return this.dataSource.getTemplate(templateId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getTemplates(agent: UserWithRole | null, args?: TemplatesArgs) {
    return this.dataSource.getTemplates(args);
  }

  @Authorized([Roles.USER_OFFICER])
  async getTemplateAsJson(user: UserWithRole | null, templateId: number) {
    return JSON.stringify(await this.dataSource.getTemplateExport(templateId));
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getComplementaryQuestions(
    agent: UserWithRole | null,
    templateId: number
  ): Promise<Question[] | null> {
    return this.dataSource.getComplementaryQuestions(templateId);
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getQuestions(
    agent: UserWithRole | null,
    filter?: QuestionsFilter
  ): Promise<Question[] | null> {
    return this.dataSource.getQuestions(filter);
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getAllQuestions(
    agent: UserWithRole | null,
    args: AllQuestionsFilterArgs
  ): Promise<{ totalCount: number; questions: Question[] }> {
    return this.dataSource.getAllQuestions(args);
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getTemplateSteps(
    agent: UserWithRole | null,
    templateId: number
  ): Promise<TemplateStep[] | null> {
    return this.dataSource.getTemplateSteps(templateId);
  }

  @Authorized([Roles.USER_OFFICER])
  async isNaturalKeyPresent(agent: UserWithRole | null, naturalKey: string) {
    return this.dataSource.isNaturalKeyPresent(naturalKey);
  }

  @Authorized([Roles.USER_OFFICER])
  getTemplateCategories(_user: UserWithRole | null) {
    return this.dataSource.getTemplateCategories();
  }

  @Authorized()
  getActiveTemplateId(
    _user: UserWithRole | null,
    templateCategoryId: TemplateGroupId
  ) {
    return this.dataSource.getActiveTemplateId(templateCategoryId);
  }

  @Authorized()
  async getQuestionByNaturalKey(user: UserWithRole | null, naturalKey: string) {
    return this.dataSource.getQuestionByNaturalKey(naturalKey);
  }

  @Authorized()
  async getDynamicMultipleChoiceOptions(
    user: UserWithRole | null,
    questionId: string
  ) {
    const question = await this.dataSource.getQuestion(questionId);
    if (!question) return [];

    const config = question.config as DynamicMultipleChoiceConfig;
    if (config.url === '') return [];

    try {
      const response = await fetch(config.url, {
        headers: config.apiCallRequestHeaders?.reduce(
          (acc, header) => ({
            ...acc,
            [header.name]: header.value,
          }),
          {}
        ),
      });

      if (!response.ok) {
        response.text().then((text) => {
          throw new Error(
            `An error occurred while sending the request: ${text}`
          );
        });
      }

      const data = await response.json();

      if (Array.isArray(data) && data.every((el) => typeof el === 'string')) {
        return data;
      }

      if (config.jsonPath !== '') {
        return jp.query(data, config.jsonPath);
      }
    } catch (error) {
      logger.logWarn('Dynamic multiple choice external api fetch failed', {
        config,
        error,
      });
    }

    return [];
  }
}
