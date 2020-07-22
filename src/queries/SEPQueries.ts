import { SEPDataSource } from '../datasources/SEPDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { User, UserWithRole } from '../models/User';

export default class SEPQueries {
  constructor(public dataSource: SEPDataSource) {}

  private async isMemberOfSEP(agent: User | null, sepId: number) {
    if (agent == null) {
      return false;
    }

    return this.dataSource.getUserSeps(agent.id).then(seps => {
      return seps.some(sepItem => sepItem.id === sepId);
    });
  }

  private async isUserOfficer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER_OFFICER;
  }

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
      (await this.isUserOfficer(agent)) ||
      (await this.isMemberOfSEP(agent, id))
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
  async getSEPProposals(
    agent: UserWithRole | null,
    { sepId, callId }: { sepId: number; callId: number }
  ) {
    if (
      (await this.isUserOfficer(agent)) ||
      (await this.isMemberOfSEP(agent, sepId))
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
  async getSEPProposalsByInstrument(
    agent: UserWithRole | null,
    {
      sepId,
      instrumentId,
      callId,
    }: { sepId: number; instrumentId: number; callId: number }
  ) {
    if (
      (await this.isUserOfficer(agent)) ||
      (await this.isMemberOfSEP(agent, sepId))
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
}
