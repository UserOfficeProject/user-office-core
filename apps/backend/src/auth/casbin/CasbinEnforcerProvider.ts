import path from 'path';

import { Enforcer, newEnforcer } from 'casbin';
import { BasicAdapter } from 'casbin-basic-adapter';
import { Client } from 'pg';
import { injectable } from 'tsyringe';

import { CasbinConditionEvaluator } from './CasbinConditionEvaluator';

@injectable()
export class CasbinEnforcerProvider {
  private enforcer: Enforcer | null = null;

  constructor() {}

  async getEnforcer(evaluator?: CasbinConditionEvaluator): Promise<Enforcer> {
    if (this.enforcer) {
      return this.enforcer;
    }

    const modelPath = path.join(__dirname, 'model.conf');

    const adapter = await BasicAdapter.newAdapter(
      'pg',
      new Client({ connectionString: process.env.DATABASE_URL })
    );

    const enforcer = await newEnforcer(modelPath, adapter);

    if (evaluator) {
      enforcer.addFunction('evalCondition', evaluator.evaluate.bind(evaluator));
    }

    enforcer.enableAutoSave(true);

    await enforcer.loadPolicy();

    this.enforcer = enforcer;

    return enforcer;
  }
}
