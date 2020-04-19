import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { ProposalTemplate } from '../models/ProposalModel';
import { Roles } from '../models/Role';
import { User } from '../models/User';

export default class TemplateQueries {
  constructor(private dataSource: TemplateDataSource) {}

  @Authorized()
  async getProposalTemplate(
    agent: User | null,
    templateId: number
  ): Promise<ProposalTemplate | null> {
    return await this.dataSource.getProposalTemplate(templateId);
  }

  @Authorized([Roles.USER_OFFICER])
  async isNaturalKeyPresent(agent: User | null, naturalKey: string) {
    return await this.dataSource.isNaturalKeyPresent(naturalKey);
  }
}
