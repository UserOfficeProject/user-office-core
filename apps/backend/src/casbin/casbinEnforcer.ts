// casbintest.ts
import path from 'path';

import { Enforcer, newEnforcer } from 'casbin';
import { SequelizeAdapter } from 'casbin-sequelize-adapter';
import { parse } from 'pg-connection-string';

import { evalCondition } from './conditionParser';

let enforcer: Enforcer | null = null;

export async function getCasbinEnforcer(): Promise<Enforcer> {
  if (enforcer) {
    return enforcer;
  }

  const modelPath = path.join(__dirname, 'model.conf');
  const config = parse(process.env.DATABASE_URL!);

  const adapter = await SequelizeAdapter.newAdapter(
    {
      dialect: 'postgres',
      host: config.host!,
      port: config.port ? parseInt(config.port) : 5432,
      username: config.user!,
      password: config.password!,
      database: config.database!,
      logging: false,
    },
    false
  );

  enforcer = await newEnforcer(modelPath, adapter);

  enforcer.addFunction('evalCondition', evalCondition);

  await enforcer.loadPolicy();
  enforcer.enableAutoSave(true);

  enforcer.enableLog(true);

  return enforcer;
}
