import { Roles } from '../models/Role';
import { Rejection, rejection } from '../rejection';
import { User } from '../resolvers/types/User';
import { userAuthorization } from '../utils/UserAuthorization';

async function asyncForEach(array: Roles[], callback: Function) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const Authorized = (roles: Roles[] = []) => {
  return (
    target: object,
    name: string,
    descriptor: {
      value?: (agent: User | null, args: any) => Promise<Rejection | any>;
    }
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const [agent] = args;
      const isMutation = target.constructor.name.includes('Mutation');

      if (!agent) {
        return isMutation ? rejection('NOT_LOGGED_IN') : null;
      }

      const result = await originalMethod?.apply(this, args);

      if (roles.length === 0) {
        return result;
      }

      let hasAccessRights = false;

      await asyncForEach(roles, async (role: string) => {
        hasAccessRights =
          hasAccessRights || (await userAuthorization.hasRole(agent, role));
      });

      if (hasAccessRights) {
        return result;
      } else {
        return isMutation ? rejection('INSUFFICIENT_PERMISSIONS') : null;
      }
    };
  };
};

export default Authorized;
