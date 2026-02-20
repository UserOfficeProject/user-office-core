import { Role } from '../../models/Role';
import { RoleDataSource, Tag } from '../RoleDataSource';

const dummyRole: Role = {
  id: 1,
  shortCode: 'admin',
  title: 'Administrator',
  description: 'Has full access to all features and settings.',
  isRootRole: false,
  permissions: [],
};
export class RoleDataSourceMock implements RoleDataSource {
  private roleTagsMap: Map<number, Set<number>> = new Map();
  private tags: Map<number, string> = new Map([
    [1, 'admin'],
    [2, 'reviewer'],
    [3, 'moderator'],
  ]);

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
