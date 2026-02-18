import { inject, injectable } from 'tsyringe';

import { CasbinService } from '../casbin/casbinService';
import { Tokens } from '../config/Tokens';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { AddCasbinPolicyInput } from '../resolvers/mutations/AddCasbinPolicyMutation';

@injectable()
export default class PermissionMutations {
  constructor(
    @inject(Tokens.CasbinService)
    public casbinService: CasbinService
  ) {}

  @Authorized()
  async addCasbinPolicy(
    agent: UserWithRole | null,
    args: AddCasbinPolicyInput
  ) {
    const addedPolicy = await this.casbinService.addPolicyWithCondition(
      args.subject,
      args.resource,
      args.action,
      args.condition,
      args.effect
    );

    if (!addedPolicy) {
      throw new Error('Failed to add policy');
    }

    return addedPolicy;
  }
}
