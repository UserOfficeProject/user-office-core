import { inject, injectable } from 'tsyringe';

import { CasbinService } from '../casbin/casbinService';
import { Tokens } from '../config/Tokens';
import { CasbinConditionDataSource } from '../datasources/CasbinConditionDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { AddCasbinPolicyInput } from '../resolvers/mutations/AddCasbinPolicyMutation';

@injectable()
export default class PermissionMutations {
  constructor(
    @inject(Tokens.CasbinService)
    public casbinService: CasbinService,
    @inject(Tokens.CasbinConditionDataSource)
    public conditionDataSource: CasbinConditionDataSource
  ) {}

  @Authorized()
  async addCasbinPolicy(
    agent: UserWithRole | null,
    args: AddCasbinPolicyInput
  ) {
    // TODO: Make this all transactional
    const resource = args.resource.toLowerCase();

    const existingPolicy = await this.casbinService.getPolicy(
      args.subject,
      resource,
      args.action
    );

    if (existingPolicy?.length) {
      const conditionId = Number(existingPolicy[0][3]) || null;

      if (conditionId) {
        const deletedCondition =
          await this.conditionDataSource.delete(conditionId);

        if (!deletedCondition) {
          throw new Error('Failed to delete existing policy condition');
        }
      }

      const deletedPolicy = await this.casbinService.removePolicy(
        args.subject,
        resource,
        args.action
      );

      if (!deletedPolicy) {
        throw new Error('Failed to remove existing policy');
      }
    }

    const addedPolicy = await this.casbinService.addPolicyWithCondition(
      args.subject,
      resource,
      args.action,
      args.condition,
      args.effect
    );

    if (!addedPolicy) {
      throw new Error('Failed to create policy');
    }

    return addedPolicy;
  }
}
