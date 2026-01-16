import { inject, injectable } from 'tsyringe';

import { CasbinService } from '../casbin/casbinService';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { TagDataSource } from '../datasources/TagDataSource';
import { UserWithRole } from '../models/User';
import { CallAccess } from '../resolvers/types/CallAccess';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class CallAuthorization {
  constructor(
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
    @inject(Tokens.TagDataSource)
    private tagDataSource: TagDataSource,
    @inject(Tokens.UserAuthorization) protected userAuth: UserAuthorization,
    @inject(Tokens.CasbinService)
    private casbinService: CasbinService
  ) {}

  async getPermissions(
    agent: UserWithRole | null,
    callPk: number
  ): Promise<CallAccess> {
    if (!agent) {
      return { canArchive: false };
    }

    return { canArchive: await this.canArchive(agent, callPk) };
  }

  async canArchive(agent: UserWithRole | null, callPk: number) {
    const userCtx = {
      role: agent?.currentRole?.shortCode,
    };

    const call = await this.callDataSource.getCall(callPk);

    const callCtx = {
      type: 'call',
      ...call,
    };

    return this.casbinService.enforce(userCtx, callCtx, 'archive');
  }

  async canRead(agent: UserWithRole | null, callPk: number) {
    const userCtx = {
      role: agent?.currentRole?.shortCode,
    };

    const call = await this.callDataSource.getCall(callPk);

    // Tags still needed in context despite being filtered at db level
    const tags = await this.tagDataSource.getCallsTags(callPk);

    const callCtx = {
      type: 'call',
      ...call,
      tags: tags,
    };

    return this.casbinService.enforce(userCtx, callCtx, 'read');
  }
}
