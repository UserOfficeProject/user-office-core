/* eslint-disable no-console */

import { Enforcer } from 'casbin';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CasbinConditionDataSource } from '../../datasources/CasbinConditionDataSource';
import { EnforcementRequest } from '../CasbinAuthorization';
import { CasbinConditionEvaluator } from './CasbinConditionEvaluator';
import { CasbinEnforcerProvider } from './CasbinEnforcerProvider';

@injectable()
export class CasbinService {
  constructor(
    @inject(Tokens.CasbinEnforcerProvider)
    private enforcerProvider: CasbinEnforcerProvider,
    @inject(Tokens.CasbinConditionDataSource)
    private casbinConditionDataSource: CasbinConditionDataSource,
    @inject(Tokens.CasbinConditionEvaluator)
    private conditionEvaluator: CasbinConditionEvaluator
  ) {}

  private getEnforcer(): Promise<Enforcer> {
    return this.enforcerProvider.getEnforcer(this.conditionEvaluator);
  }

  async enforce(req: EnforcementRequest): Promise<boolean> {
    const enforcer = await this.getEnforcer();

    const result = await enforcer.enforce(req[0], req[1], req[2]);

    return result;
  }

  async batchEnforce(requests: Array<EnforcementRequest>): Promise<boolean[]> {
    const enforcer = await this.getEnforcer();

    return enforcer.batchEnforce(requests);
  }

  async addPolicyWithCondition(
    role: string,
    obj: string,
    act: string,
    conditionJson: string,
    allowOrDeny: string
  ): Promise<boolean> {
    let conditionRecord = null;

    if (conditionJson) {
      conditionRecord =
        await this.casbinConditionDataSource.create(conditionJson);
    }

    const enforcer = await this.getEnforcer();

    const addedPolicy = await enforcer.addPolicy(
      role,
      obj,
      act,
      conditionRecord ? String(conditionRecord.id) : '',
      allowOrDeny
    );

    return addedPolicy;
  }

  async getPolicy(
    role: string,
    obj: string,
    act: string
  ): Promise<string[][] | null> {
    const enforcer = await this.getEnforcer();

    const policies = await enforcer.getFilteredPolicy(0, role, obj, act);

    return policies.length > 0 ? policies : null;
  }

  async getPolicyCondition(
    role: string,
    obj: string,
    act: string
  ): Promise<string | null> {
    const policies = await this.getPolicy(role, obj, act);

    if (!policies) return null;

    const conditionId = (policies.length && Number(policies[0][3])) || null;

    if (!conditionId || isNaN(conditionId)) {
      return null;
    }

    const conditionRecord =
      await this.casbinConditionDataSource.get(conditionId);

    return conditionRecord?.condition || null;
  }

  async removePolicy(role: string, obj: string, act: string): Promise<boolean> {
    const enforcer = await this.getEnforcer();

    return await enforcer.removeFilteredPolicy(0, role, obj, act);
  }
}
