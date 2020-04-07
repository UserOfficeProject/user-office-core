import { CallDataSource } from '../datasources/CallDataSource';
import { Call } from '../models/Call';
import { User } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';
import { CallsFilter } from './../resolvers/queries/CallsQuery';

export default class CallQueries {
  constructor(
    private dataSource: CallDataSource,
    private userAuth: UserAuthorization
  ) {}

  async get(agent: User | null, id: number) {
    if (agent == null) {
      return null;
    }
    const call = await this.dataSource.get(id);

    return call;
  }

  async getAll(agent: User | null, filter?: CallsFilter) {
    if (agent == null) {
      return null;
    }
    const calls = await this.dataSource.getCalls(filter);

    return calls;
  }
}
