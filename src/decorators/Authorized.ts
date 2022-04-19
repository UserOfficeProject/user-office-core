import { logger } from '@user-office-software/duo-logger';
import { AuthenticationError } from 'apollo-server-core';

import { Rejection, rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

const Authorized = (roles: Roles[] = []) => {
  return (
    target: any,
    name: string,
    descriptor: {
      value?: (
        agent: UserWithRole | null,
        ...args: any[]
      ) => Promise<Rejection | any>;
    }
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const [agent] = args;
      const isMutation = target.constructor.name.includes('Mutation');

      if (agent?.isApiAccessToken) {
        if (agent?.accessPermissions?.[`${target.constructor.name}.${name}`]) {
          return await originalMethod?.apply(this, args);
        } else {
          return isMutation ? rejection('INSUFFICIENT_PERMISSIONS') : null;
        }
      }

      if (!agent) {
        return isMutation ? rejection('NOT_LOGGED_IN') : null;
      }

      if (agent.externalToken && !agent.externalTokenValid) {
        logger.logWarn('External token invalid/Expired', {
          externalToken: agent.externalToken,
        });

        return isMutation
          ? rejection('EXTERNAL_TOKEN_INVALID')
          : new AuthenticationError('EXTERNAL_TOKEN_INVALID', {
              externalToken: agent.externalToken,
            });
      }

      if (roles.length === 0) {
        return await originalMethod?.apply(this, args);
      }

      const hasAccessRights = roles.some(
        (role) => role === agent.currentRole?.shortCode
      );

      if (hasAccessRights) {
        return await originalMethod?.apply(this, args);
      } else {
        return isMutation ? rejection('INSUFFICIENT_PERMISSIONS') : null;
      }
    };
  };
};

export default Authorized;
