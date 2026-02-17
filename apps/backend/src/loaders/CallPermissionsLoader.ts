// callPermissionsLoader.ts
import DataLoader from 'dataloader';
import { inject, injectable } from 'tsyringe';

import {
  CallContextData,
  CallContextFetcher,
} from '../auth/authContexts/CallContext';
import { EnforcementRequest } from '../auth/CasbinAuthorization';
import { CasbinService } from '../casbin/casbinService';
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
    @inject(Tokens.CallContextFetcher)
    private contextFetcher: CallContextFetcher,
    @inject(Tokens.CasbinService) private casbinService: CasbinService
  ) {}

  createLoader(
    user: UserWithRole | null
  ): DataLoader<number, CallUiPermissions> {
    return new DataLoader(
      async (callIds: readonly number[]) => {
        const userRole = user?.currentRole?.shortCode;

        if (!userRole) {
          return callIds.map(() => createEmptyCallUiPermissions());
        }

        const uniqueCallIds = [...new Set(callIds)];

        const contextMap =
          await this.contextFetcher.fetchContextForCalls(uniqueCallIds);

        const actions = Object.entries(CALL_ACTIONS);
        const enforcementRequests: EnforcementRequest<CallContextData>[] = [];

        for (const callId of uniqueCallIds) {
          const context = contextMap.get(callId);
          if (!context) continue;

          for (const [_, action] of actions) {
            enforcementRequests.push([userRole, context, action]);
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
