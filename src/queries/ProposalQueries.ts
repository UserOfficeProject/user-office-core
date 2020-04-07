import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { Proposal } from '../models/Proposal';
import { ProposalStatus, ProposalEndStatus } from '../models/ProposalModel';
import { User } from '../models/User';
import { Logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import { ProposalsFilter } from './../resolvers/queries/ProposalsQuery';

export default class ProposalQueries {
  constructor(
    private dataSource: ProposalDataSource,
    private userAuth: UserAuthorization,
    private logger: Logger
  ) {}

  async get(agent: User | null, id: number) {
    const proposal = await this.dataSource.get(id);

    if (!proposal) {
      return null;
    }

    //If not a user officer remove excellence, tehnical and safety score
    if (!(await this.userAuth.isUserOfficer(agent))) {
      delete proposal.rankOrder;
      delete proposal.finalStatus;
    }
    if ((await this.hasAccessRights(agent, proposal)) === true) {
      return proposal;
    } else {
      return null;
    }
  }

  async getQuestionary(agent: User | null, id: number) {
    const proposal = await this.dataSource.get(id);

    if ((await this.hasAccessRights(agent, proposal)) === false) {
      return null;
    }

    return await this.dataSource.getQuestionary(id);
  }

  private async hasAccessRights(
    agent: User | null,
    proposal: Proposal | null
  ): Promise<boolean> {
    if (proposal == null) {
      return true;
    }

    return (
      (await this.userAuth.isUserOfficer(agent)) ||
      (await this.userAuth.isMemberOfProposal(agent, proposal)) ||
      (await this.userAuth.isReviewerOfProposal(agent, proposal.id))
    );
  }

  async getAll(
    agent: User | null,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getProposals(filter, first, offset);
    } else {
      return null;
    }
  }

  async getBlank(agent: User | null) {
    if (agent == null) {
      return null;
    }

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.dataSource.checkActiveCall())
    ) {
      return null;
    }

    const blankProposal = new Proposal(
      0,
      '',
      '',
      agent.id,
      ProposalStatus.BLANK,
      new Date(),
      new Date(),
      '',
      0,
      ProposalEndStatus.UNSET
    );

    return blankProposal;
  }
}
