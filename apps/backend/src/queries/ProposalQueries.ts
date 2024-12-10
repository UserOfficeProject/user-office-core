import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { Proposal } from '../models/Proposal';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import {
  ProposalBookingFilter,
  ProposalBookingScheduledEventFilterCore,
} from '../resolvers/types/ProposalBooking';
import { omit } from '../utils/helperFunctions';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';
import { ProposalsFilter } from './../resolvers/queries/ProposalsQuery';

@injectable()
export default class ProposalQueries {
  constructor(
    @inject(Tokens.ProposalDataSource) public dataSource: ProposalDataSource,
    @inject(Tokens.ReviewDataSource) public reviewDataSource: ReviewDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
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
      !this.userAuth.isInstrumentScientist(agent)
    ) {
      proposal = omit(proposal, 'commentForManagement') as Proposal;
    }

    // If user not notified remove finalStatus and comment as these are not confirmed and it is not user officer
    if (!this.userAuth.isUserOfficer(agent) && !proposal.notified) {
      proposal = omit(proposal, 'finalStatus', 'commentForUser') as Proposal;
    }

    if ((await this.hasReadRights(agent, proposal)) === true) {
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

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getAll(
    agent: UserWithRole | null,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getProposals(filter, first, offset);
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllView(
    agent: UserWithRole | null,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ) {
    try {
      // leave await here because getProposalsFromView might thrown an exception
      // and we want to handle it here
      return await this.dataSource.getProposalsFromView(
        filter,
        first,
        offset,
        sortField,
        sortDirection,
        searchText
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
  async getProposalBookingsByProposalPk(
    agent: UserWithRole | null,
    {
      proposalPk,
      filter,
    }: { proposalPk: number; filter?: ProposalBookingFilter }
  ) {
    const proposal = await this.get(agent, proposalPk);
    if (!proposal) {
      return null;
    }

    const proposalBookings =
      await this.dataSource.getProposalBookingsByProposalPk(proposalPk, filter);

    return proposalBookings;
  }

  @Authorized()
  async getAllProposalBookingsScheduledEvents(
    agent: UserWithRole | null,
    {
      proposalBookingIds,
      filter,
    }: {
      proposalBookingIds: number[];
      filter?: ProposalBookingScheduledEventFilterCore;
    }
  ) {
    return await this.dataSource.getAllProposalBookingsScheduledEvents(
      proposalBookingIds,
      filter
    );
  }

  @Authorized()
  async getProposalById(agent: UserWithRole | null, proposalId: string) {
    const proposal = await this.dataSource.getProposalById(proposalId);

    if ((await this.hasReadRights(agent, proposal)) === true) {
      return proposal;
    } else {
      return null;
    }
  }
}
