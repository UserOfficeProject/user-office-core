import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { SEPsFilter } from '../resolvers/queries/SEPsQuery';

@injectable()
export default class SEPQueries {
  constructor(
    @inject(Tokens.SEPDataSource) public dataSource: SEPDataSource,
    @inject(Tokens.ProposalDataSource)
    public proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized([
    Roles.USER_OFFICER,
    Roles.SEP_CHAIR,
    Roles.SEP_SECRETARY,
    Roles.SEP_REVIEWER,
  ])
  async get(agent: UserWithRole | null, id: number) {
    const sep = await this.dataSource.getSEP(id);

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
  async getAll(agent: UserWithRole | null, filter?: SEPsFilter) {
    return this.dataSource.getSEPs(filter);
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async getMembers(agent: UserWithRole | null, sepId: number) {
    return this.dataSource.getMembers(sepId);
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
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
    { sepId, callId }: { sepId: number; callId: number | null }
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
    { sepId, proposalPk }: { sepId: number; proposalPk: number }
  ) {
    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfSEP(agent, sepId))
    ) {
      return this.dataSource.getSEPProposal(sepId, proposalPk);
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
      proposalPk,
    }: {
      sepId: number;
      proposalPk: number;
    }
  ) {
    let reviewerId = null;

    const proposalEvents = await this.proposalDataSource.getProposalEvents(
      proposalPk
    );

    // NOTE: If not officer, SEP Chair or SEP Secretary should return all proposal assignments only if everything is submitted. Otherwise for SEP Reviewer return only it's own proposal reviews.
    if (
      agent &&
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent, sepId)) &&
      !proposalEvents?.proposal_all_sep_reviews_submitted
    ) {
      reviewerId = agent.id;
    }

    return this.dataSource.getSEPProposalAssignments(
      sepId,
      proposalPk,
      reviewerId
    );
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async getProposalSepMeetingDecision(
    agent: UserWithRole | null,
    proposalPk: number
  ) {
    const [sepMeetingDecision] =
      await this.dataSource.getProposalsSepMeetingDecisions([proposalPk]);
    const sep = await this.dataSource.getSEPByProposalPk(proposalPk);

    if (!sepMeetingDecision || !sep) {
      return null;
    }

    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfSEP(agent, sep.id))
    ) {
      return sepMeetingDecision;
    } else {
      return null;
    }
  }
}
