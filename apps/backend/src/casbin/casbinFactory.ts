import path from 'path';

import { newEnforcer, Enforcer } from 'casbin';
import { SequelizeAdapter } from 'casbin-sequelize-adapter';
import { parse } from 'pg-connection-string';

export async function createCasbinEnforcer(): Promise<Enforcer> {
  const modelPath = path.join(__dirname, 'model.conf');

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) throw new Error('DATABASE_URL not defined');

  const config = parse(DATABASE_URL);

  const adapter = await SequelizeAdapter.newAdapter(
    {
      dialect: 'postgres',
      host: config.host!,
      port: config.port ? parseInt(config.port) : 5432,
      username: config.user,
      password: config.password,
      database: config.database!,
      logging: false,
    },
    true
  );

  const enforcer = await newEnforcer(modelPath, adapter);
  await enforcer.loadPolicy();
  enforcer.enableAutoSave(true);

  return enforcer;
}
