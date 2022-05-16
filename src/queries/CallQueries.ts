import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CallsFilter } from './../resolvers/queries/CallsQuery';

@injectable()
export default class CallQueries {
  constructor(
    @inject(Tokens.CallDataSource) public dataSource: CallDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async get(agent: UserWithRole | null, id: number) {
    const call = await this.dataSource.getCall(id);

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
    return this.dataSource.getCall(id);
  }

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getCallsByInstrumentScientist(
    agent: UserWithRole | null,
    scientistId: number
  ) {
    if (!this.userAuth.isUserOfficer(agent) && agent?.id !== scientistId) {
      return null;
    }

    return this.dataSource.getCallsByInstrumentScientist(scientistId);
  }
}
