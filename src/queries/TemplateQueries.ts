import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { TemplateStep, Question } from '../models/ProposalModel';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ProposalTemplatesArgs } from '../resolvers/queries/ProposalTemplatesQuery';

export default class TemplateQueries {
  constructor(private dataSource: TemplateDataSource) {}

  @Authorized()
  async getComplementaryQuestions(
    agent: UserWithRole | null,
    templateId: number
  ): Promise<Question[] | null> {
    return this.dataSource.getComplementaryQuestions(templateId);
  }

  @Authorized()
  async getProposalTemplateSteps(
    agent: UserWithRole | null,
    templateId: number
  ): Promise<TemplateStep[] | null> {
    return this.dataSource.getProposalTemplateSteps(templateId);
  }

  @Authorized([Roles.USER_OFFICER])
  async isNaturalKeyPresent(agent: UserWithRole | null, naturalKey: string) {
    return this.dataSource.isNaturalKeyPresent(naturalKey);
  }

  @Authorized([Roles.USER_OFFICER])
  async getProposalTemplates(
    agent: UserWithRole | null,
    args?: ProposalTemplatesArgs
  ) {
    return this.dataSource.getProposalTemplates(args);
  }

  @Authorized()
  async getProposalTemplate(agent: UserWithRole | null, templateId: number) {
    return this.dataSource.getProposalTemplate(templateId);
  }
}
