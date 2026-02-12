import { inject, injectable } from 'tsyringe';
import { Authorized } from '../decorators';
import { PermissionRule } from '../models/PermissionRule';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { Tokens } from '../config/Tokens';
import { PermissionDataSource } from '../datasources/PermissionDataSource';
import { CreatePermissionRuleArgs } from '../resolvers/mutations/CreatePermissionRuleMutation';
import { UpdatePermissionRuleArgs } from '../resolvers/mutations/UpdatePermissionRuleMutation';

@injectable()
export default class PermissionMutations {
  constructor(
    @inject(Tokens.PermissionDataSource) private datasource: PermissionDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async delete(agent: UserWithRole | null, id: number): Promise<PermissionRule | null> {
    return this.datasource.deletePermissionRule(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async create(agent: UserWithRole | null, args: CreatePermissionRuleArgs): Promise<PermissionRule | null> {
    return this.datasource.createPermissionRule(args);
  }

  @Authorized([Roles.USER_OFFICER])
  async update(agent: UserWithRole | null, args: UpdatePermissionRuleArgs): Promise<PermissionRule | null> {
    return this.datasource.updatePermissionRule(args);
  }
}