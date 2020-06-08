import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { TemplateStep, Question } from '../models/ProposalModel';
import { Roles } from '../models/Role';
import { User } from '../models/User';
import { TemplatesArgs } from '../resolvers/queries/TemplatesQuery';

export default class TemplateQueries {
  constructor(private dataSource: TemplateDataSource) {}

  @Authorized()
  async getComplementaryQuestions(
    agent: User | null,
    templateId: number
  ): Promise<Question[] | null> {
    return this.dataSource.getComplementaryQuestions(templateId);
  }

  @Authorized()
  async getTemplateSteps(
    agent: User | null,
    templateId: number
  ): Promise<TemplateStep[] | null> {
    return this.dataSource.getTemplateSteps(templateId);
  }

  @Authorized([Roles.USER_OFFICER])
  async isNaturalKeyPresent(agent: User | null, naturalKey: string) {
    return this.dataSource.isNaturalKeyPresent(naturalKey);
  }

  @Authorized([Roles.USER_OFFICER])
  async getTemplates(agent: User | null, args?: TemplatesArgs) {
    return this.dataSource.getTemplates(args);
  }

  @Authorized()
  async getTemplate(agent: User | null, templateId: number) {
    return this.dataSource.getTemplate(templateId);
  }
}
