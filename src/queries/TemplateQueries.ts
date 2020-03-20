import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { ProposalTemplate } from '../models/ProposalModel';
import { User } from '../models/User';
import { Logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class TemplateQueries {
  constructor(
    private dataSource: TemplateDataSource,
    private userAuth: UserAuthorization,
    private logger: Logger
  ) {}

  async getProposalTemplate(
    agent: User | null
  ): Promise<ProposalTemplate | null> {
    if (!agent) {
      return null;
    }

    return await this.dataSource.getProposalTemplate();
  }

  async isNaturalKeyPresent(agent: User | null, naturalKey: string) {
    if (!agent) {
      return null;
    }

    if (!(await this.userAuth.isUserOfficer(agent))) {
      return null;
    }

    return await this.dataSource.isNaturalKeyPresent(naturalKey);
  }
}
