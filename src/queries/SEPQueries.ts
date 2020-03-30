import { SEPDataSource } from '../datasources/SEPDataSource';
import { User } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class SEPQueries {
  constructor(
    private dataSource: SEPDataSource,
    private userAuth: UserAuthorization
  ) {}

  async get(agent: User | null, id: number) {
    const sep = await this.dataSource.get(id);

    if (!sep) {
      return null;
    }

    if (await this.userAuth.isUserOfficer(agent)) {
      return sep;
    } else {
      return null;
    }
  }

  async getAll(
    agent: User | null,
    filter?: string,
    first?: number,
    offset?: number
  ) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getAll(filter, first, offset);
    } else {
      return null;
    }
  }
}
