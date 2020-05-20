import { SEPDataSource } from '../datasources/SEPDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { User } from '../models/User';

export default class SEPQueries {
  constructor(public dataSource: SEPDataSource) {}

  @Authorized([Roles.USER_OFFICER])
  async get(agent: User | null, id: number) {
    const sep = await this.dataSource.get(id);

    if (!sep) {
      return null;
    }

    return sep;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(
    agent: User | null,
    active = true,
    filter?: string,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getAll(active, filter, first, offset);
  }

  @Authorized([Roles.USER_OFFICER])
  async getMembers(agent: User | null, sepId: number) {
    return this.dataSource.getMembers(sepId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getSEPProposals(agent: User | null, sepId: number) {
    return this.dataSource.getSEPProposals(sepId);
  }

  // TODO: Check if this is going to be used. If not remove it!
  @Authorized([Roles.USER_OFFICER])
  async getAssignments(
    agent: User | null,
    { sepId, proposalId }: { sepId: number; proposalId: number }
  ) {
    return this.dataSource.getAssignments(sepId, proposalId);
  }
}
