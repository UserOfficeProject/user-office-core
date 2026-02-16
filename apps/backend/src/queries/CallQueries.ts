import { inject, injectable } from 'tsyringe';

import { CasbinAuthorization } from '../auth/CasbinAuthorization';
import { CallContextFetcher } from '../auth/contexts/CallContext';
import { CallAuthFilterBuilder } from '../auth/filters/CallAuthFilterBuilder';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CallsFilter } from '../resolvers/queries/CallsQuery';

@injectable()
export default class CallQueries {
  constructor(
    @inject(Tokens.CallDataSource) public dataSource: CallDataSource,
    @inject(Tokens.CasbinAuthorization) private casbinAuth: CasbinAuthorization,
    @inject(Tokens.CallAuthFilterBuilder)
    private authFilterBuilder: CallAuthFilterBuilder,
    @inject(Tokens.CallContextFetcher)
    private authContextFetcher: CallContextFetcher,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async get(agent: UserWithRole | null, id: number) {
    const call = await this.dataSource.getCall(id);

    return call;
  }

  @Authorized()
  async getAll(agent: UserWithRole | null, filter?: CallsFilter) {
    // Role check would move to decorator
    const role = agent?.currentRole?.shortCode;
    if (!role) {
      return [];
    }

    if (filter?.isActiveInternal && !agent?.isInternalUser) {
      delete filter?.isActiveInternal;
    }

    // Optional optimisation
    const authFilters = await this.authFilterBuilder.buildDbFilters(
      role,
      'call',
      'read'
    );

    filter = { ...filter, ...authFilters };

    const calls = await this.dataSource.getCalls(filter);

    const authContexts = await this.authContextFetcher.fetchContextForCalls(
      calls.map((c) => c.id)
    );

    const results = await this.casbinAuth.canBulk(role, authContexts, 'read');

    return calls.filter((call) => results.get(call.id));
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
