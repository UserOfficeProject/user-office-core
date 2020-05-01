import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { TemplateStep } from '../models/ProposalModel';
import { Roles } from '../models/Role';
import { User } from '../models/User';
import { ProposalTemplatesArgs } from '../resolvers/queries/ProposalTemplatesQuery';

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
  async getProposalTemplateSteps(
    agent: User | null,
    templateId: number
  ): Promise<TemplateStep[] | null> {
    return this.dataSource.getProposalTemplateSteps(templateId);
  }

  @Authorized([Roles.USER_OFFICER])
  async isNaturalKeyPresent(agent: User | null, naturalKey: string) {
    return this.dataSource.isNaturalKeyPresent(naturalKey);
  }

  @Authorized([Roles.USER_OFFICER])
  async getProposalTemplates(agent: User | null, args?: ProposalTemplatesArgs) {
    return this.dataSource.getProposalTemplates(args);
  }

  @Authorized()
  async getProposalTemplate(agent: User | null, templateId: number) {
    return this.dataSource.getProposalTemplate(templateId);
  }
}
