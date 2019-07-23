import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { UserAuthorization } from "../utils/UserAuthorization";

export default class ProposalQueries {
  constructor(
    private dataSource: ProposalDataSource,
    private userAuth: UserAuthorization
  ) {}

  async get(agent: User | null, id: number) {
    const proposal = await this.dataSource.get(id);
    if (
      (await this.userAuth.isUserOfficer(agent)) ||
      (await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return proposal;
    } else {
      return null;
    }
  }

  async getAll(
    agent: User | null,
    filter: string,
    first: number,
    offset: number
  ) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getProposals(filter, first, offset);
    } else {
      return null;
    }
  }
}
