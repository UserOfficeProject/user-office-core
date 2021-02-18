import { SEPDataSource } from '../datasources/SEPDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class SEPQueries {
  constructor(
    public dataSource: SEPDataSource,
    private userAuth: UserAuthorization
  ) {}

  @Authorized([
    Roles.USER_OFFICER,
    Roles.SEP_CHAIR,
    Roles.SEP_SECRETARY,
    Roles.SEP_REVIEWER,
  ])
  async get(agent: UserWithRole | null, id: number) {
    const sep = await this.dataSource.get(id);

    if (!sep) {
      return null;
    }

    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfSEP(agent, id))
    ) {
      return sep;
    } else {
      return null;
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(
    agent: UserWithRole | null,
    active = true,
    filter?: string,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getAll(active, filter, first, offset);
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.SEP_CHAIR,
    Roles.SEP_SECRETARY,
    Roles.SEP_REVIEWER,
  ])
  async getMembers(agent: UserWithRole | null, sepId: number) {
    return this.dataSource.getMembers(sepId);
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.SEP_CHAIR,
    Roles.SEP_SECRETARY,
    Roles.SEP_REVIEWER,
  ])
  async getReviewers(agent: UserWithRole | null, sepId: number) {
    return this.dataSource.getReviewers(sepId);
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.SEP_CHAIR,
    Roles.SEP_SECRETARY,
    Roles.SEP_REVIEWER,
  ])
  async getSEPProposals(
    agent: UserWithRole | null,
    { sepId, callId }: { sepId: number; callId: number }
  ) {
    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfSEP(agent, sepId))
    ) {
      return this.dataSource.getSEPProposals(sepId, callId);
    } else {
      return null;
    }
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.SEP_CHAIR,
    Roles.SEP_SECRETARY,
    Roles.SEP_REVIEWER,
  ])
  async getSEPProposal(
    agent: UserWithRole | null,
    { sepId, proposalId }: { sepId: number; proposalId: number }
  ) {
    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfSEP(agent, sepId))
    ) {
      return this.dataSource.getSEPProposal(sepId, proposalId);
    } else {
      return null;
    }
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.SEP_CHAIR,
    Roles.SEP_SECRETARY,
    Roles.SEP_REVIEWER,
  ])
  async getSEPProposalsByInstrument(
    agent: UserWithRole | null,
    {
      sepId,
      instrumentId,
      callId,
    }: { sepId: number; instrumentId: number; callId: number }
  ) {
    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfSEP(agent, sepId))
    ) {
      return this.dataSource.getSEPProposalsByInstrument(
        sepId,
        instrumentId,
        callId
      );
    } else {
      return null;
    }
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.SEP_CHAIR,
    Roles.SEP_SECRETARY,
    Roles.SEP_REVIEWER,
  ])
  async getSEPProposalAssignments(
    agent: UserWithRole | null,
    {
      sepId,
      proposalId,
    }: {
      sepId: number;
      proposalId: number;
    }
  ) {
    let reviewerId = null;

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent!.id, sepId))
    ) {
      reviewerId = agent!.id;
    }

    return this.dataSource.getSEPProposalAssignments(
      sepId,
      proposalId,
      reviewerId
    );
  }
}
