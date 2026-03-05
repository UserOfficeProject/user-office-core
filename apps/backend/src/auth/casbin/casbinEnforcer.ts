// casbintest.ts
import path from 'path';

import { Enforcer, newEnforcer } from 'casbin';
import { BasicAdapter } from 'casbin-basic-adapter';
import { Client } from 'pg';

import { evalCondition } from './conditionParser';

let enforcer: Enforcer | null = null;

export async function getCasbinEnforcer(): Promise<Enforcer> {
  if (enforcer) {
    return enforcer;
  }

  const modelPath = path.join(__dirname, 'model.conf');

  const adapter = await BasicAdapter.newAdapter(
    'pg',
    new Client({ connectionString: process.env.DATABASE_URL })
  );

  enforcer = await newEnforcer(modelPath, adapter);

  enforcer.addFunction('evalCondition', evalCondition);

  enforcer.enableAutoSave(true);

  await enforcer.loadPolicy();

  return enforcer;
}
