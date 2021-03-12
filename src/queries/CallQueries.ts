import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { userAuthorization } from '../utils/UserAuthorization';
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

  // TODO: figure out the role parts
  @Authorized()
  async byRef(agent: UserWithRole | null, id: number) {
    return this.dataSource.get(id);
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getCallsByInstrumentScientist(
    agent: UserWithRole | null,
    scientistId: number
  ) {
    if (
      !(await userAuthorization.isUserOfficer(agent)) &&
      agent?.id !== scientistId
    ) {
      return null;
    }

    return this.dataSource.getCallsByInstrumentScientist(scientistId);
  }
}
