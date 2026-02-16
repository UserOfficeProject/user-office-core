/* eslint-disable no-console */

import { Enforcer } from 'casbin';
import { inject, injectable } from 'tsyringe';

import { EnforcementRequest } from '../auth/CasbinAuthorization';
import { Tokens } from '../config/Tokens';
import { CasbinConditionDataSource } from '../datasources/CasbinConditionDataSource';
import { getCasbinEnforcer } from './casbinEnforcer';

type PolicyDecision =
  | { type: 'deny' }
  | { type: 'allow' }
  | { type: 'conditional'; conditionId: number };

@injectable()
export class CasbinService {
  constructor(
    @inject(Tokens.CasbinConditionDataSource)
    private casbinConditionDataSource: CasbinConditionDataSource
  ) {}

  private getEnforcer(): Promise<Enforcer> {
    return getCasbinEnforcer();
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
    const conditionRecord =
      await this.casbinConditionDataSource.create(conditionJson);

    const enforcer = await this.getEnforcer();

    const addedPolicy = await enforcer.addPolicy(
      role,
      obj,
      act,
      String(conditionRecord.id),
      allowOrDeny
    );

    return addedPolicy;
  }

  async getPolicyDecision(
    role: string,
    obj: string,
    act: string
  ): Promise<PolicyDecision> {
    const enforcer = await this.getEnforcer();

    const policies = await enforcer.getFilteredPolicy(0, role, obj, act);

    if (policies.length === 0) {
      return { type: 'deny' };
    }

    const conditionId = Number(policies[0][3]) || null;

    if (!conditionId) {
      return { type: 'allow' };
    }

    return { type: 'conditional', conditionId: conditionId };
  }

  async getPolicyConditionJson(id: number): Promise<string | null> {
    const conditionRecord = await this.casbinConditionDataSource.get(id);

    return conditionRecord?.condition || null;
  }
}
