import { inject, injectable } from 'tsyringe';

import { CallAuthorization } from '../auth/CallAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized } from '../decorators';
import { Call } from '../models/Call';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CallsFilter } from '../resolvers/queries/CallsQuery';

@injectable()
export default class CallQueries {
  constructor(
    @inject(Tokens.CallDataSource) public dataSource: CallDataSource,
    @inject(Tokens.CallAuthorization) private callAuth: CallAuthorization,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async get(agent: UserWithRole | null, id: number) {
    const call = await this.dataSource.getCall(id);

    return call;
  }

  @Authorized()
  async getAll(agent: UserWithRole | null, filter?: CallsFilter) {
    if (filter?.isActiveInternal && !agent?.isInternalUser) {
      delete filter?.isActiveInternal;
    }

    delete filter?.proposalStatusShortCode;

    const calls = await this.dataSource.getCalls(filter);

    const allowedCalls: Call[] = [];
    // Could pass a list for performance
    for (const call of calls) {
      if (await this.callAuth.canRead(agent, call.id)) {
        allowedCalls.push(call);
      }
    }

    return allowedCalls;
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
    if (
      this.userAuth.isApiToken(agent) ||
      (!this.userAuth.isUserOfficer(agent) && agent?.id !== scientistId)
    ) {
      return null;
    }

    return this.dataSource.getCallsByInstrumentScientist(scientistId);
  }

  @Authorized()
  async getCallOfAnswersProposal(user: UserWithRole | null, answerId: number) {
    return this.dataSource.getCallByAnswerIdProposal(answerId);
  }
}
