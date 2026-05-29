import { Role, createRole } from '../../models/Role';
import { CreateRoleArgs } from '../../resolvers/mutations/CreateRoleMutation';
import { UpdateRoleArgs } from '../../resolvers/mutations/UpdateRoleMutation';
import { RoleDataSource, Tag } from '../RoleDataSource';

const dummyRole: Role = createRole(
  1,
  'admin',
  'Administrator',
  'Has full access to all features and settings.',
  {},
  false
);

export class RoleDataSourceMock implements RoleDataSource {
  private roleTagsMap: Map<number, Set<number>> = new Map();
  private tags: Map<number, string> = new Map([
    [1, 'admin'],
    [2, 'reviewer'],
    [3, 'moderator'],
  ]);

  async createRole(args: CreateRoleArgs): Promise<Role> {
    return createRole(
      1,
      args.shortCode,
      args.title,
      args.description,
      {},
      false
    );
  }

  async updateRole(args: UpdateRoleArgs): Promise<Role> {
    return createRole(
      args.roleID || 1,
      args.shortCode,
      args.title,
      args.description,
      {},
      false
    );
  }

  async deleteRole(id: number): Promise<Role> {
    return createRole(id, 'deleted', 'deleted', 'deleted', {}, false);
  }

  async updateRoleTags(roleId: number, tagIds: number[]): Promise<Role> {
    const validTagIds = tagIds.filter((tagId) => this.tags.has(tagId));
    this.roleTagsMap.set(roleId, new Set(validTagIds));

    return dummyRole;
  }

  async getTagsByRoleId(roleId: number): Promise<Tag[]> {
    const tagIds = this.roleTagsMap.get(roleId) || new Set<number>();

    return Array.from(tagIds).map((tagId) => {
      const name = this.tags.get(tagId) || '';

      return {
        id: tagId,
        name,
        shortCode: name,
      } as Tag;
    });
  }
}
