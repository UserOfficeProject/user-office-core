import { logger } from '@user-office-software/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { Authorized } from '../decorators';
import {
  Proposal,
  ProposalEndStatus,
  ProposalPublicStatus,
} from '../models/Proposal';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import {
  ProposalBookingFilter,
  ProposalBookingScheduledEventFilterCore,
} from '../resolvers/types/ProposalBooking';
import { omit } from '../utils/helperFunctions';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';
import { ProposalsFilter } from './../resolvers/queries/ProposalsQuery';

const statusMap = new Map<ProposalEndStatus, ProposalPublicStatus>();
statusMap.set(ProposalEndStatus.ACCEPTED, ProposalPublicStatus.accepted);
statusMap.set(ProposalEndStatus.REJECTED, ProposalPublicStatus.rejected);
statusMap.set(ProposalEndStatus.RESERVED, ProposalPublicStatus.reserved);

@injectable()
export default class ProposalQueries {
  private proposalAuth = container.resolve(ProposalAuthorization);

  constructor(
    @inject(Tokens.ProposalDataSource) public dataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async get(agent: UserWithRole | null, primaryKey: number) {
    let proposal = await this.dataSource.get(primaryKey);

    if (!proposal) {
      return null;
    }

    // If not a user officer remove excellence, technical and safety score
    if (!this.userAuth.isUserOfficer(agent)) {
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

  @Authorized([Roles.USER_OFFICER])
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

  @Authorized([Roles.INSTRUMENT_SCIENTIST])
  async getInstrumentScientistProposals(
    agent: UserWithRole | null,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getInstrumentScientistProposals(
      agent?.id as number,
      filter,
      first,
      offset
    );
  }

  async getPublicStatus(agent: UserWithRole | null, id: number) {
    const proposal = await this.get(agent, id);
    if (!proposal) {
      return ProposalPublicStatus.unknown;
    }

    if (proposal.submitted) {
      return (
        statusMap.get(proposal.finalStatus) || ProposalPublicStatus.submitted
      );
    } else {
      return ProposalPublicStatus.draft;
    }
  }

  @Authorized()
  async getProposalBookingByProposalPk(
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

    const proposalBooking =
      await this.dataSource.getProposalBookingByProposalPk(proposalPk, filter);

    if (!proposalBooking) {
      return null;
    }

    return proposalBooking;
  }

  @Authorized()
  async proposalBookingScheduledEvents(
    agent: UserWithRole | null,
    {
      proposalBookingId,
      filter,
    }: {
      proposalBookingId: number;
      filter?: ProposalBookingScheduledEventFilterCore;
    }
  ) {
    return await this.dataSource.proposalBookingScheduledEvents(
      proposalBookingId,
      filter
    );
  }
}
