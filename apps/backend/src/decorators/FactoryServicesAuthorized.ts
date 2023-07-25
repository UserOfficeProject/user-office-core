import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
type Descriptor = {
  value?: (agent: UserWithRole, ...args: any[]) => Promise<any>;
};

const FactoryServicesAuthorized = (roles: Roles[] = []) => {
  return (target: any, name: string, descriptor: Descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const [agent] = args;

      if (agent?.isApiAccessToken) {
        if (agent?.accessPermissions?.[`${target.constructor.name}.${name}`]) {
          return await originalMethod?.apply(this, args);
        } else {
          throw new Error('INSUFFICIENT_PERMISSIONS');
        }
      }

      if (!agent) {
        throw new Error('NOT_LOGGED_IN');
      }

      if (agent.externalToken && !agent.externalTokenValid) {
        throw new Error('EXTERNAL_TOKEN_INVALID');
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
        throw new Error('INSUFFICIENT_PERMISSIONS');
      }
    };
  };
};

export default FactoryServicesAuthorized;
