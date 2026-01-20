import { Tag } from '../models/Tag';

export interface RoleDataSource {
  addTagToRole(roleId: number, tagId: number): Promise<void>;
  removeTagFromRole(roleId: number, tagId: number): Promise<void>;
  getTagsByRoleId(roleId: number): Promise<Tag[]>;
}

export { Tag };
