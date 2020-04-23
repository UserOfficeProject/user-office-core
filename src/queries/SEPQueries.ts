import { SEPDataSource } from '../datasources/SEPDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { User } from '../models/User';

export default class SEPQueries {
  constructor(private dataSource: SEPDataSource) {}

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
    filter?: string,
    first?: number,
    offset?: number
  ) {
    return this.dataSource.getAll(filter, first, offset);
  }

  @Authorized([Roles.USER_OFFICER])
  async getAssignments(agent: User | null, id: number) {
    return this.dataSource.getAssignments(id);
  }
}
