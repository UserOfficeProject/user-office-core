import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { RoleDataSource } from '../datasources/RoleDataSource';
import { Authorized } from '../decorators';
import { Tag } from '../models/Tag';
import { UserWithRole } from '../models/User';

@injectable()
export default class RoleTagsQuery {
  constructor(
    @inject(Tokens.RoleDataSource)
    private roleDataSource: RoleDataSource
  ) {}

  @Authorized()
  async getTagsByRoleId(
    user: UserWithRole | null,
    roleId: number
  ): Promise<Tag[]> {
    return this.roleDataSource.getTagsByRoleId(roleId);
  }
}
