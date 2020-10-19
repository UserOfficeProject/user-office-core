import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { Authorized } from '../decorators';
import { Proposal } from '../models/Proposal';
import { ProposalEndStatus } from '../models/Proposal';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { omit } from '../utils/helperFunctions';
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
  async get(agent: UserWithRole | null, id: number) {
    let proposal = await this.dataSource.get(id);

    if (!proposal) {
      return null;
    }

    // If not a user officer remove excellence, technical and safety score
    if (!(await this.userAuth.isUserOfficer(agent))) {
      proposal = omit(
        proposal,
        'rankOrder',
        'commentForManagement'
      ) as Proposal;
    }

    // If user not notified remove finalStatus and comment as these are not confirmed and it is not user officer
    if (!(await this.userAuth.isUserOfficer(agent)) && !proposal.notified) {
      proposal = omit(proposal, 'finalStatus', 'commentForUser') as Proposal;
    }

    if ((await this.hasAccessRights(agent, proposal)) === true) {
      return proposal;
    } else {
      return null;
    }
  }

  byRef(id: number) {
    return this.dataSource.get(id);
  }

  private async hasAccessRights(
    agent: UserWithRole | null,
    proposal: Proposal | null
  ): Promise<boolean> {
    if (proposal == null) {
      return true;
    }

    return (
      (await this.userAuth.isUserOfficer(agent)) ||
      (await this.userAuth.isMemberOfProposal(agent, proposal)) ||
      (await this.userAuth.isReviewerOfProposal(agent, proposal.id)) ||
      (await this.userAuth.isScientistToProposal(agent, proposal.id))
    );
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
    return this.dataSource.getProposalsFromView(filter);
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
}
