import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { RoleDataSource } from '../datasources/RoleDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class RoleTagsMutation {
  constructor(
    @inject(Tokens.RoleDataSource)
    private roleDataSource: RoleDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async addTagToRole(
    user: UserWithRole | null,
    roleId: number,
    tagId: number
  ): Promise<void> {
    await this.roleDataSource.addTagToRole(roleId, tagId);
  }

  @Authorized([Roles.USER_OFFICER])
  async removeTagFromRole(
    user: UserWithRole | null,
    roleId: number,
    tagId: number
  ): Promise<void> {
    await this.roleDataSource.removeTagFromRole(roleId, tagId);
  }
}
