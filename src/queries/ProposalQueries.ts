import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { UserAuthorization } from "../utils/UserAuthorization";
import { ProposalTemplate } from "../models/ProposalModel";
import { Proposal } from "../models/Proposal";
import { ILogger } from "../utils/Logger";

export default class ProposalQueries {
  constructor(
    private dataSource: ProposalDataSource,
    private userAuth: UserAuthorization,
    private logger: ILogger
  ) {}

  async get(agent: User | null, id: number) {
    const proposal = await this.dataSource.get(id);

    if (!proposal) {
      return null;
    }

    if ((await this.hasAccessRights(agent, proposal)) === true) {
      return proposal;
    } else {
      return null;
    }
  }

  async getQuestionary(agent: User, id: number) {
    const proposal = await this.dataSource.get(id);

    if (!proposal) {
      return null;
    }

    if ((await this.hasAccessRights(agent, proposal)) === false) {
      return null;
    }

    return await this.dataSource.getQuestionary(id);
  }

  async getProposalTemplate(
    agent: User | null
  ): Promise<ProposalTemplate | null> {
    if (agent == null) {
      return null;
    }

    return await this.dataSource.getProposalTemplate();
  }

  private async hasAccessRights(
    agent: User | null,
    proposal: Proposal
  ): Promise<boolean> {
    return (
      (await this.userAuth.isUserOfficer(agent)) ||
      (await this.userAuth.isMemberOfProposal(agent, proposal)) ||
      (await this.userAuth.isReviewerOfProposal(agent, proposal.id))
    );
  }

  async getAll(
    agent: User | null,
    filter?: string,
    first?: number,
    offset?: number
  ) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getProposals(filter, first, offset);
    } else {
      return null;
    }
  }
}
