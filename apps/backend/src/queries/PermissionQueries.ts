import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { PermissionDataSource } from '../datasources/PermissionDataSource';
import { Authorized } from '../decorators';
import { rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class PermissionQueries {
  constructor(
    @inject(Tokens.PermissionDataSource)
    public dataSource: PermissionDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getAll(agent: UserWithRole | null) {
    return await this.dataSource.getPermissions().catch((error) => {
      return rejection('Could not get all permissions', { agent }, error);
    });
  }
}
