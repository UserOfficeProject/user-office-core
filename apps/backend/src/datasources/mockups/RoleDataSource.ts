import { RoleDataSource, Tag } from '../RoleDataSource';

export class RoleDataSourceMock implements RoleDataSource {
  private roleTagsMap: Map<number, Set<number>> = new Map();
  private tags: Map<number, string> = new Map([
    [1, 'admin'],
    [2, 'reviewer'],
    [3, 'moderator'],
  ]);

  async addTagToRole(roleId: number, tagId: number): Promise<void> {
    if (!this.tags.has(tagId)) {
      throw new Error(`Tag with id ${tagId} not found`);
    }

    if (!this.roleTagsMap.has(roleId)) {
      this.roleTagsMap.set(roleId, new Set());
    }

    this.roleTagsMap.get(roleId)!.add(tagId);
  }

  async removeTagFromRole(roleId: number, tagId: number): Promise<void> {
    if (this.roleTagsMap.has(roleId)) {
      this.roleTagsMap.get(roleId)!.delete(tagId);
    }
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
