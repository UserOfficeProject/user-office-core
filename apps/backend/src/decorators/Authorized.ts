import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UserDataSource } from '../datasources/UserDataSource';
import { Rejection, rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
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

      // Note: For OAuth the agent.externalTokenValid is always TRUE

      if (!agent.externalTokenValid) {
        logger.logWarn('External token invalid/Expired', {
          externalToken: agent.externalToken,
        });

        return isMutation
          ? rejection('EXTERNAL_TOKEN_INVALID')
          : new GraphQLError('EXTERNAL_TOKEN_INVALID', {
              extensions: {
                code: 'EXTERNAL_TOKEN_INVALID',
                value: agent.externalToken,
              },
            });
      }

      if (roles.length === 0) {
        return await originalMethod?.apply(this, args);
      }

      const userDataSource = container.resolve<UserDataSource>(
        Tokens.UserDataSource
      );

      const rolesArray: Role[] = await userDataSource.getUserRoles(agent.id);
      const userRoles: Record<string, { permissions: string[] }> =
        rolesArray.reduce(
          (acc, role) => {
            acc[role.shortCode] = { permissions: role.permissions };

            return acc;
          },
          {} as Record<string, { permissions: string[] }>
        );

      //check if user has dynamic role with permissions for this method
      if (
        agent.currentRole?.shortCode &&
        userRoles[agent.currentRole.shortCode]?.permissions.some(
          (permission: string) =>
            permission === `${target.constructor.name}.${name}`
        )
      ) {
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
