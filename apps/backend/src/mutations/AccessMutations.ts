import { inject, injectable } from 'tsyringe';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { AccessRule } from '../models/AccessRule';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { Tokens } from '../config/Tokens';
import { AccessDataSource } from '../datasources/AccessDataSource';
import { CreateAccessRuleInput } from '../resolvers/mutations/CreateAccessRuleMutation';

@injectable()
export default class AccessMutations {
  constructor(
    @inject(Tokens.AccessDataSource) private datasource: AccessDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async delete(agent: UserWithRole | null, id: number): Promise<AccessRule | null> {
    return this.datasource.deleteAccessRule(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async create(agent: UserWithRole | null, args: CreateAccessRuleInput): Promise<AccessRule | null> {
    return this.datasource.createAccessRule(args);
  }
}