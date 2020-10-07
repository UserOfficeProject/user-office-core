import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { CallsFilter } from './../resolvers/queries/CallsQuery';

export default class CallQueries {
  constructor(public dataSource: CallDataSource) {}

  @Authorized()
  async get(agent: UserWithRole | null, id: number) {
    const call = await this.dataSource.get(id);

    return call;
  }

  @Authorized()
  async getAll(agent: UserWithRole | null, filter?: CallsFilter) {
    const calls = await this.dataSource.getCalls(filter);

    return calls;
  }

  // TODO: maybe put these behind feature flag (although they are not accessible anyway)
  // and use some kind of shared API token between gateway and user-office to authorize the requests
  byRef(id: number) {
    return this.dataSource.get(id);
  }
}
