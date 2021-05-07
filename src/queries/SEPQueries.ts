import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

@injectable()
export default class SEPQueries {
  constructor(
    @inject(Tokens.SEPDataSource) public dataSource: SEPDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
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
    active?: boolean,
    filter?: string,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getAll(active, filter, first, offset);
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async getMembers(agent: UserWithRole | null, sepId: number) {
    return this.dataSource.getMembers(sepId);
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async getReviewers(agent: UserWithRole | null, sepId: number) {
    return this.dataSource.getReviewers(sepId);
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
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

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
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

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
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
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent, sepId))
    ) {
      reviewerId = agent!.id;
    }

    return this.dataSource.getSEPProposalAssignments(
      sepId,
      proposalId,
      reviewerId
    );
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async getProposalSepMeetingDecision(
    agent: UserWithRole | null,
    proposalId: number
  ) {
    const [
      sepMeetingDecision,
    ] = await this.dataSource.getProposalsSepMeetingDecisions([proposalId]);

    if (!sepMeetingDecision) {
      return null;
    }

    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfSEP(agent, proposalId))
    ) {
      return sepMeetingDecision;
    } else {
      return null;
    }
  }
}
