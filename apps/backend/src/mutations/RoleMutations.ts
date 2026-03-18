import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { RoleDataSource } from '../datasources/RoleDataSource';
import { Authorized } from '../decorators';
import { rejection, Rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CreateRoleArgs } from '../resolvers/mutations/CreateRoleMutation';
import { UpdateRoleArgs } from '../resolvers/mutations/UpdateRoleMutation';

@injectable()
export default class RoleMutations {
  constructor(
    @inject(Tokens.RoleDataSource) private dataSource: RoleDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async createRole(
    _: UserWithRole | null,
    args: CreateRoleArgs
  ): Promise<Role | Rejection> {
    try {
      const role = await this.dataSource.createRole(args);

      return role;
    } catch (err) {
      return rejection('Could not create role', { args }, err);
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async updateRole(
    _: UserWithRole | null,
    args: UpdateRoleArgs
  ): Promise<Role | Rejection> {
    try {
      const role = await this.dataSource.updateRole(args);

      return role;
    } catch (err) {
      return rejection('Could not update role', { args }, err);
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteRole(
    _: UserWithRole | null,
    id: number
  ): Promise<Role | Rejection> {
    try {
      const role = await this.dataSource.deleteRole(id);

      return role;
    } catch (err) {
      return rejection('Could not delete role', { id }, err);
    }
  }
}
