import { Permission } from '../models/Permission';

export interface PermissionDataSource {
  getPermissions(): Promise<{ totalCount: number; permissions: Permission[] }>;
}
