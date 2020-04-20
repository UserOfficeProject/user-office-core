import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized } from '../decorators';
import { User } from '../models/User';

export default class CallQueries {
  constructor(private dataSource: CallDataSource) {}

  @Authorized()
  async get(agent: User | null, id: number) {
    const call = await this.dataSource.get(id);

    return call;
  }

  @Authorized()
  async getAll(agent: User | null) {
    const calls = await this.dataSource.getCalls();

    return calls;
  }
}
