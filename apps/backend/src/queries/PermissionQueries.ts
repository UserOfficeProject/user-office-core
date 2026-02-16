import { inject, injectable } from 'tsyringe';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { Tokens } from '../config/Tokens';
import { PermissionDataSource } from '../datasources/PermissionDataSource';
import { PermissionRulesArgs } from '../resolvers/queries/PermissionsQuery';

@injectable()
export default class PermissionQueries {
  constructor(@inject(Tokens.PermissionDataSource) public dataSource: PermissionDataSource)
  {}

  @Authorized()
  async getPermissionRule(agent: UserWithRole | null, id: number) {
    return this.dataSource.getPermissionRule(id);
  }

  @Authorized()
  async getPermissionRules(agent: UserWithRole | null, filter?: PermissionRulesArgs) {
    return this.dataSource.getPermissionRules(filter);
  }
}