import { User } from "../models/User";
import { UserAuthorization } from "../utils/UserAuthorization";
import { ProposalTemplate } from "../models/ProposalModel";
import { ILogger } from "../utils/Logger";
import { TemplateDataSource } from "../datasources/TemplateDataSource";

export default class TemplateQueries {
  constructor(
    private dataSource: TemplateDataSource,
    private userAuth: UserAuthorization,
    private logger: ILogger
  ) {}

  async getProposalTemplate(
    agent: User | null
  ): Promise<ProposalTemplate | null> {
    if (agent == null) {
      return null;
    }

    return await this.dataSource.getProposalTemplate();
  }
}
