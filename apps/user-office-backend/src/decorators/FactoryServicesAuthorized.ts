import { logger } from '@user-office-software/duo-logger';

import { UserWithRole } from '../models/User';

const FactoryServicesAuthorized = (accessPermission?: string) => {
  return (
    target: any,
    methodName: string,
    propertyDescriptor: {
      value?: (userWithRole: UserWithRole, ...args: any[]) => Promise<any>;
    }
  ) => {
    const originalMethod = propertyDescriptor.value;
    propertyDescriptor.value = async function (...args) {
      const [userWithRole] = args;
      if (!userWithRole) {
        throw new Error('INSUFFICIENT_PERMISSIONS');
      }
      if (userWithRole?.isApiAccessToken) {
        const accessPermissionName =
          `${target.constructor.name}.${methodName}` as string;

        // This is access permission name check will be removed next commit

        logger.logInfo('Access Permission Name check', {
          message: accessPermissionName,
        });

        // This is access permissions check will be removed next commit

        logger.logInfo('Access Permissions check', {
          message: userWithRole?.accessPermissions,
        });

        if (
          (accessPermission &&
            Object.keys(userWithRole?.accessPermissions).includes(
              accessPermission
            )) ||
          Object.keys(userWithRole?.accessPermissions).includes(
            accessPermissionName
          )
        ) {
          return await originalMethod?.apply(this, args);
        } else {
          throw new Error('INSUFFICIENT_PERMISSIONS');
        }
      }
    };
  };
};

export default FactoryServicesAuthorized;
