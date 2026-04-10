import { Instrument } from '../models/Instrument';
import { Role } from '../models/Role';
import { Tag } from '../models/Tag';
import { CreateRoleArgs } from '../resolvers/mutations/CreateRoleMutation';
import { UpdateRoleArgs } from '../resolvers/mutations/UpdateRoleMutation';

export interface RoleDataSource {
  createRole(args: CreateRoleArgs): Promise<Role>;
  updateRole(args: UpdateRoleArgs): Promise<Role>;
  deleteRole(id: number): Promise<Role>;
  updateRoleTags(roleId: number, tagIds: number[]): Promise<Role>;
  getTagsByRoleId(roleId: number): Promise<Tag[]>;
  getInstrumentsByRoleId(agent: number): Promise<Instrument[]>;
}

export { Tag };
