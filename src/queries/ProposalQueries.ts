import { logger } from '@esss-swap/duo-logger';
import { container, inject, injectable } from 'tsyringe';

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
import { UserAuthorization } from '../utils/UserAuthorization';
import { ProposalsFilter } from './../resolvers/queries/ProposalsQuery';

const statusMap = new Map<ProposalEndStatus, ProposalPublicStatus>();
statusMap.set(ProposalEndStatus.ACCEPTED, ProposalPublicStatus.accepted);
statusMap.set(ProposalEndStatus.REJECTED, ProposalPublicStatus.rejected);
statusMap.set(ProposalEndStatus.RESERVED, ProposalPublicStatus.reserved);

@injectable()
export default class ProposalQueries {
  private userAuth = container.resolve(UserAuthorization);

  constructor(
    @inject(Tokens.ProposalDataSource) public dataSource: ProposalDataSource
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

    if ((await this.hasAccessRights(agent, proposal)) === true) {
      return proposal;
    } else {
      return null;
    }
  }

  @Authorized()
  async byRef(agent: UserWithRole | null, id: number) {
    return this.dataSource.get(id);
  }

  private async hasAccessRights(
    agent: UserWithRole | null,
    proposal: Proposal | null
  ): Promise<boolean> {
    if (proposal == null) {
      return true;
    }

    return this.userAuth.hasAccessRights(agent, proposal);
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
  async getAllView(agent: UserWithRole | null, filter?: ProposalsFilter) {
    try {
      // leave await here because getProposalsFromView might thrown an exception
      // and we want to handle it here
      return await this.dataSource.getProposalsFromView(filter);
    } catch (e) {
      logger.logException('Method getAllView failed', e as Error, { filter });

      return [];
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
    const proposalBookingScheduledEvents =
      await this.dataSource.proposalBookingScheduledEvents(
        proposalBookingId,
        filter
      );

    return proposalBookingScheduledEvents;
  }
}
