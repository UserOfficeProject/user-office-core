import DataLoader from 'dataloader';
import { inject, injectable } from 'tsyringe';

import {
  CallContextData,
  CallAuthContext,
} from '../auth/authContexts/CallAuthContext';
import { UserAuthContext } from '../auth/authContexts/UserAuthContext';
import { CasbinService } from '../auth/casbin/CasbinService';
import { EnforcementRequest } from '../auth/CasbinAuthorization';
import { Tokens } from '../config/Tokens';
import { UserWithRole } from '../models/User';
import {
  CALL_ACTIONS,
  CallUiPermissions,
} from '../resolvers/types/CallUiPermissions';

export function createEmptyCallUiPermissions(): CallUiPermissions {
  return {
    canArchive: false,
  };
}

@injectable()
export default class CallPermissionsLoader {
  constructor(
    @inject(Tokens.UserAuthContext)
    private userAuthContext: UserAuthContext,
    @inject(Tokens.CallAuthContext)
    private authContext: CallAuthContext,
    @inject(Tokens.CasbinService) private casbinService: CasbinService
  ) {}

  createLoader(
    user: UserWithRole | null
  ): DataLoader<number, CallUiPermissions> {
    return new DataLoader(
      async (callIds: readonly number[]) => {
        const userCtx = await this.userAuthContext.toContextData(user);

        if (!userCtx) {
          return callIds.map(() => createEmptyCallUiPermissions());
        }

        const uniqueCallIds = [...new Set(callIds)];

        const contextMap =
          await this.authContext.fetchContextForCalls(uniqueCallIds);

        const actions = Object.entries(CALL_ACTIONS);
        const enforcementRequests: EnforcementRequest<CallContextData>[] = [];

        for (const callId of uniqueCallIds) {
          const callCtx = contextMap.get(callId);
          if (!callCtx) continue;

          for (const [_, action] of actions) {
            enforcementRequests.push([userCtx, callCtx, action]);
          }
        }

        const results =
          await this.casbinService.batchEnforce(enforcementRequests);

        const permissionsMap = new Map<number, CallUiPermissions>();

        uniqueCallIds.forEach((callId, callIndex) => {
          const baseIndex = callIndex * actions.length;
          permissionsMap.set(callId, {
            canArchive: results[baseIndex],
          });
        });

        return callIds.map(
          (callId) =>
            permissionsMap.get(callId) || createEmptyCallUiPermissions()
        );
      },
      {
        cacheKeyFn: (callId) => callId.toString(),
      }
    );
  }
}
