import { injectable } from 'tsyringe';

import { Permission } from '../../models/Permission';
import { PermissionDataSource } from '../PermissionDataSource';
import database from './database';
import { PermissionRecord } from './records';

@injectable()
export default class PostgresPermissionDataSource
  implements PermissionDataSource
{
  createPermissionObject(permission: PermissionRecord): Permission {
    return new Permission(
      permission.id,
      permission.role,
      permission.object,
      permission.action,
      permission.call,
      permission.instrument_ids,
      permission.facility,
      permission.instrument_operator,
      permission.custom_filter
    );
  }

  async getPermissions(): Promise<{
    totalCount: number;
    permissions: Permission[];
  }> {
    return database
      .select(['*'])
      .from('policies')
      .orderBy('id', 'desc')
      .then((permissions: PermissionRecord[]) => {
        const result = permissions.map((permission) =>
          this.createPermissionObject(permission)
        );

        return {
          totalCount: permissions ? permissions.length : 0,
          permissions: result,
        };
      })
      .catch((error) => {
        throw new Error(`Error getting permissions: ${error}`);
      });
  }
}
