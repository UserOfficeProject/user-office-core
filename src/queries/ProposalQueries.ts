import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { Authorized } from '../decorators';
import { Proposal } from '../models/Proposal';
import { ProposalStatus, ProposalEndStatus } from '../models/ProposalModel';
import { Roles } from '../models/Role';
import { User } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class ProposalQueries {
  constructor(
    private dataSource: ProposalDataSource,
    private userAuth: UserAuthorization
  ) {}

  @Authorized()
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

  // NOTE: Duplicate function! We have this same function under userAuth.
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

  @Authorized([Roles.USER_OFFICER])
  async getAll(
    agent: User | null,
    filter?: string,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getProposals(filter, first, offset);
  }

  @Authorized()
  async getBlank(agent: User | null) {
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
      (agent as User).id,
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
