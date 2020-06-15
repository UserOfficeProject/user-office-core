import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

export default class InstrumentQueries {
  constructor(private dataSource: InstrumentDataSource) {}

  @Authorized()
  async get(agent: UserWithRole | null, id: number) {
    const instrument = await this.dataSource.get(id);

    return instrument;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(agent: UserWithRole | null) {
    const instruments = await this.dataSource.getAll();

    return instruments;
  }
}
