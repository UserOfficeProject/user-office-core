import { Role } from '../models/Role';
import { Tag } from '../models/Tag';

export interface RoleDataSource {
  updateRoleTags(roleId: number, tagIds: number[]): Promise<Role>;
  getTagsByRoleId(roleId: number): Promise<Tag[]>;
}

export { Tag };
