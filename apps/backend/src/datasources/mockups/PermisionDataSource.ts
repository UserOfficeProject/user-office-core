import { Permission } from '../../models/Permission';
import { PermissionDataSource } from '../PermissionDataSource';

export class PermissionDataSourceMock implements PermissionDataSource {
  async getPermissions(): Promise<{
    totalCount: number;
    permissions: Permission[];
  }> {
    return { totalCount: 0, permissions: [] };
  }
}
