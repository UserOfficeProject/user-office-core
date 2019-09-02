import { CallDataSource } from "../datasources/CallDataSource";
import { User } from "../models/User";
import { Call } from "../models/Call";
import { UserAuthorization } from "../utils/UserAuthorization";

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

  async getAll(agent: User | null) {
    if (agent == null) {
      return null;
    }
    const calls = await this.dataSource.getCalls();
    return calls;
  }
}
