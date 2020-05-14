import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { Authorized } from '../decorators';
import { Proposal } from '../models/Proposal';
import { ProposalEndStatus, ProposalStatus } from '../models/ProposalModel';
import { Roles } from '../models/Role';
import { User } from '../models/User';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import { CallDataSource } from './../datasources/CallDataSource';
import { ProposalsFilter } from './../resolvers/queries/ProposalsQuery';

export default class ProposalQueries {
  constructor(
    public dataSource: ProposalDataSource,
    private callDataSource: CallDataSource,
    private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async get(agent: User | null, id: number) {
    const proposal = await this.dataSource.get(id);

    if (!proposal) {
      return null;
    }

    //If not a user officer remove excellence, technical and safety score
    if (!(await this.userAuth.isUserOfficer(agent))) {
      delete proposal.rankOrder;
      delete proposal.finalStatus;
      delete proposal.commentForUser;
      delete proposal.commentForManagement;
    }

    if ((await this.hasAccessRights(agent, proposal)) === true) {
      return proposal;
    } else {
      return null;
    }
  }

  async getQuestionary(agent: User | null, proposalId: number) {
    const proposal = await this.dataSource.get(proposalId);

    if ((await this.hasAccessRights(agent, proposal)) === false) {
      return null;
    }

    return await this.dataSource.getQuestionary(proposalId);
  }

  async getEmptyQuestionary(user: User | null, callId: number) {
    return await this.dataSource.getEmptyQuestionary(callId);
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
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getProposals(filter, first, offset);
  }

  @Authorized()
  async getBlank(agent: User | null, callId: number) {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.dataSource.checkActiveCall(callId))
    ) {
      return null;
    }

    const call = await this.callDataSource.get(callId);
    if (!call) {
      logger.logError('User tried accessing non existing call', {
        callId,
        agent,
      });

      return null;
    }

    if (!call.templateId) {
      logger.logError('User tried to getBlank for misconfigured call', {
        call,
      });

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
      ProposalEndStatus.UNSET,
      call?.id,
      call?.templateId,
      '',
      ''
    );

    return blankProposal;
  }
}
