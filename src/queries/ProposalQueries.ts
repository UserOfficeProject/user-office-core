import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { UserAuthorization } from "../utils/UserAuthorization";
import { ProposalTemplate, Proposal } from "../models/Proposal";
import { Rejection, rejection } from "../rejection";

export default class ProposalQueries {
  constructor(
    private dataSource: ProposalDataSource,
    private userAuth: UserAuthorization
  ) {}

  async get(agent: User | null, id: number) {
    const proposal = await this.dataSource.get(id);

    if (!proposal) {
      return null;
    }

    if (await this.hasAccessRights(agent, proposal) === true) {
      return proposal;
    } else {
      return null;
    }
  }

  async getAnswers(agent: User | null, id:number) {
    const proposal = await this.dataSource.get(id);

    if (!proposal) {
      return null;
    }

    if (await this.hasAccessRights(agent, proposal) === true) {
      return await this.dataSource.getProposalAnswers(proposal.id);
    } else {
      return null;
    }
  }

  private async hasAccessRights(agent: User | null, proposal:Proposal):Promise<boolean> {
    return (await this.userAuth.isUserOfficer(agent)) ||
    (await this.userAuth.isMemberOfProposal(agent, proposal)) ||
    (await this.userAuth.isReviewerOfProposal(agent, proposal.id))
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

  async getProposalTemplate(agent: User | null):Promise<ProposalTemplate | Rejection>
  {
    if (agent == null) {
      return rejection("Not authorized");
    }

    return await this.dataSource.getProposalTemplate();
  }
}
