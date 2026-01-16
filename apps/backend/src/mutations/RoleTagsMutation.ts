import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { RoleDataSource } from '../datasources/RoleDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';

@injectable()
export default class RoleTagsMutation {
  constructor(
    @inject(Tokens.RoleDataSource)
    private roleDataSource: RoleDataSource
  ) {}

  @Authorized()
  async addTagToRole(
    user: UserWithRole | null,
    roleId: number,
    tagId: number
  ): Promise<void> {
    await this.roleDataSource.addTagToRole(roleId, tagId);
  }

  @Authorized()
  async removeTagFromRole(
    user: UserWithRole | null,
    roleId: number,
    tagId: number
  ): Promise<void> {
    await this.roleDataSource.removeTagFromRole(roleId, tagId);
  }
}
