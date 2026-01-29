import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import TagDataSource from '../datasources/postgres/TagDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalInternalCommentsDataSource } from '../datasources/ProposalInternalCommentsDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { RoleDataSource } from '../datasources/RoleDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized } from '../decorators';
import { Proposal } from '../models/Proposal';
import { rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ProposalsFilter } from '../resolvers/queries/ProposalsQuery';
import { omit } from '../utils/helperFunctions';

@injectable()
export default class ProposalQueries {
  constructor(
    @inject(Tokens.ProposalDataSource) public dataSource: ProposalDataSource,
    @inject(Tokens.UserDataSource) public userDataSource: UserDataSource,
    @inject(Tokens.ExperimentDataSource)
    public experimentDataSource: ExperimentDataSource,
    @inject(Tokens.ReviewDataSource) public reviewDataSource: ReviewDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization,
    @inject(Tokens.ProposalInternalCommentsDataSource)
    public proposalInternalCommentsDataSource: ProposalInternalCommentsDataSource,
    @inject(Tokens.RoleDataSource) private roleDataSource: RoleDataSource,
    @inject(Tokens.TagDataSource) public tagDataSource: TagDataSource
  ) {}

  @Authorized()
  async get(agent: UserWithRole | null, primaryKey: number) {
    let proposal = await this.dataSource.get(primaryKey);
    if (!proposal) {
      return null;
    }
    // If not a user officer or instrument scientist remove excellence, technical and safety score
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !this.userAuth.isInstrumentScientist(agent) &&
      !this.userAuth.isApiToken(agent)
    ) {
      proposal = omit(proposal, 'commentForManagement') as Proposal;
    }

    // If user not notified remove finalStatus and comment as these are not confirmed and it is not user officer
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !proposal.notified &&
      !this.userAuth.isApiToken(agent)
    ) {
      proposal = omit(proposal, 'commentForUser') as Proposal;
    }
    if (
      this.userAuth.isApiToken(agent) ||
      (await this.hasReadRights(agent, proposal))
    ) {
      return proposal;
    } else {
      return null;
    }
  }

  @Authorized()
  async byRef(agent: UserWithRole | null, id: number) {
    return this.dataSource.get(id);
  }

  private async hasReadRights(
    agent: UserWithRole | null,
    proposal: Proposal | null
  ): Promise<boolean> {
    if (proposal == null) {
      return true;
    }

    return this.proposalAuth.hasReadRights(agent, proposal);
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.DYNAMIC_PROPOSAL_READER,
  ])
  async getAll(
    agent: UserWithRole | null,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getProposals(filter, first, offset);
  }

  @Authorized([Roles.USER_OFFICER, Roles.DYNAMIC_PROPOSAL_READER])
  async getAllView(
    agent: UserWithRole | null,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ) {
    const instrumentFilter: number[] = [];
    const callFilter: number[] = [];

    if (agent && agent.currentRole?.isRootRole === false) {
      const tags = await this.roleDataSource.getTagsByRoleId(
        agent.currentRole!.id
      );
      for (const tag of tags) {
        const instruments = await this.tagDataSource.getTagInstruments(tag.id);
        instrumentFilter.push(
          ...instruments.map((instrument) => instrument.id)
        );

        const calls = await this.tagDataSource.getTagCalls(tag.id);
        callFilter.push(...calls.map((call) => call.id));
      }
    }
    try {
      return await this.dataSource.getProposalsFromView(
        filter,
        first,
        offset,
        sortField,
        sortDirection,
        searchText,
        undefined,
        instrumentFilter,
        callFilter
      );
    } catch (e) {
      logger.logException('Method getAllView failed', e as Error, { filter });

      return { totalCount: 0, proposalViews: [] };
    }
  }

  // NOTE: Internal reviewer has similar view as instrument scientist and it needs to get the proposals where the one is assigned as reviewer.
  @Authorized([Roles.INSTRUMENT_SCIENTIST, Roles.INTERNAL_REVIEWER])
  async getInstrumentScientistProposals(
    agent: UserWithRole | null,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getInstrumentScientistProposals(
      agent!,
      filter,
      first,
      offset
    );
  }

  @Authorized([Roles.INSTRUMENT_SCIENTIST, Roles.USER_OFFICER])
  async getTechniqueScientistProposals(
    agent: UserWithRole | null,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ) {
    return this.dataSource.getTechniqueScientistProposals(
      agent!,
      filter,
      first,
      offset,
      sortField,
      sortDirection,
      searchText
    );
  }

  @Authorized()
  async getProposalById(agent: UserWithRole | null, proposalId: string) {
    const proposal = await this.dataSource.getProposalById(proposalId);

    if (
      this.userAuth.isApiToken(agent) ||
      (await this.hasReadRights(agent, proposal))
    ) {
      return proposal;
    } else {
      return null;
    }
  }

  @Authorized([Roles.INSTRUMENT_SCIENTIST, Roles.USER_OFFICER])
  async getProposalScientistComment(
    agent: UserWithRole | null,
    proposalPk: number
  ) {
    return await this.proposalInternalCommentsDataSource
      .getProposalInternalComment(proposalPk)
      .catch((error) => {
        return rejection(
          `Could not get proposal scientist comment proposal: '${proposalPk}'`,
          { agent, args: proposalPk },
          error
        );
      });
  }

  @Authorized()
  async getExperimentsByProposalPk(
    agent: UserWithRole | null,
    proposalPk: number
  ) {
    const proposal = await this.get(agent, proposalPk);
    if (!proposal) {
      return null;
    }

    return await this.experimentDataSource.getExperimentsByProposalPk(
      proposalPk
    );
  }

  @Authorized([Roles.USER_OFFICER, Roles.USER])
  async getInvitedProposal(agent: UserWithRole | null, inviteId: number) {
    return this.dataSource.getInvitedProposal(inviteId);
  }
}
