import { Roles } from '../models/Role';
import { Rejection, rejection } from '../rejection';
import { User } from '../resolvers/types/User';
import { userAuthorization } from '../utils/UserAuthorization';

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
      const [agent, inputArgs] = args;
      const isMutation = target.constructor.name.includes('Mutation');

      if (!agent) {
        return isMutation ? rejection('NOT_LOGGED_IN') : null;
      }

      const result = await originalMethod?.apply(this, args);

      if (roles.length === 0) {
        return result;
      }

      let hasAccessRights = false;

      if (roles.includes(Roles.USER_OFFICER)) {
        hasAccessRights = await userAuthorization.isUserOfficer(agent);
      }

      // NOTE: This is not a good check if it is a user or not. It should do the same check as isUserOfficer.
      if (roles.includes(Roles.USER) && !hasAccessRights) {
        const userId = inputArgs.id ? inputArgs.id : inputArgs;
        hasAccessRights = await userAuthorization.isUser(agent, userId);
      }

      if (hasAccessRights) {
        return result;
      } else {
        return isMutation ? rejection('INSUFFICIENT_PERMISSIONS') : null;
      }
    };
  };
};

export default Authorized;
