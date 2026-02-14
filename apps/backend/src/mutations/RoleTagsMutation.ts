import { injectable, inject } from 'tsyringe';

import { Tokens } from '../config/Tokens'; // Correct import path for Tokens
import { RoleDataSource } from '../datasources/RoleDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class RoleTagsMutation {
  constructor(
    @inject(Tokens.RoleDataSource) private roleDataSource: RoleDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async updateRoleTags(
    agent: UserWithRole | null,
    roleId: number,
    tagIds: number[]
  ): Promise<any> {
    const role = await this.roleDataSource.updateRoleTags(roleId, tagIds);

    return role;
  }
}
