import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { RoleDataSource } from '../datasources/RoleDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Rejection, rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { AgentTagsMetadataKey } from './AgentTags';

export { AgentTags, AgentTagsMetadataKey } from './AgentTags';

const injectDynamicRoleArgs = async (
  agent: UserWithRole,
  args: any[],
  indices: {
    tags: number[];
  }
) => {
  const roleDataSource = container.resolve<RoleDataSource>(
    Tokens.RoleDataSource
  );

  const tags = await roleDataSource.getTagsByRoleId(agent.currentRole!.id);
  const tagIds = tags.map((tag) => tag.id);

  indices.tags.forEach((index) => {
    args[index] = tagIds; // inject tag ids to the argument
  });
};

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

      const execute = async () => {
        if (agent?.currentRole?.isRootRole === false) {
          const agentTagsIndices: number[] =
            Reflect.getOwnMetadata(AgentTagsMetadataKey, target, name) || [];

          if (agentTagsIndices.length > 0) {
            await injectDynamicRoleArgs(agent!, args, {
              tags: agentTagsIndices,
            });
          }
        }

        return await originalMethod?.apply(this, args);
      };

      if (agent?.isApiAccessToken) {
        if (agent?.accessPermissions?.[`${target.constructor.name}.${name}`]) {
          return await execute();
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
        return await execute();
      }

      const userDataSource = container.resolve<UserDataSource>(
        Tokens.UserDataSource
      );

      const rolesArray: Role[] = await userDataSource.getUserRoles(agent.id);
      const userRoles: Record<string, { permissions: string[] }> =
        rolesArray.reduce(
          (acc, role) => {
            acc[role.id] = { permissions: role.permissions };

            return acc;
          },
          {} as Record<string, { permissions: string[] }>
        );

      //check if user has dynamic role with permissions for this method
      if (
        agent.currentRole?.id &&
        userRoles[agent.currentRole.id]?.permissions.some(
          (permission: string) =>
            permission === `${target.constructor.name}.${name}`
        )
      ) {
        return await execute();
      }

      const hasAccessRights = roles.some(
        (role) => role === agent.currentRole?.shortCode
      );

      if (hasAccessRights) {
        return await execute();
      } else {
        return isMutation ? rejection('INSUFFICIENT_PERMISSIONS') : null;
      }
    };
  };
};

export default Authorized;
