import path from 'path';

import { Enforcer, newEnforcer } from 'casbin';
import { SequelizeAdapter } from 'casbin-sequelize-adapter';
import { parse } from 'pg-connection-string';
import { injectable } from 'tsyringe';

@injectable()
export class CasbinService {
  private enforcerPromise: Promise<Enforcer>;

  constructor() {
    this.enforcerPromise = this.init();
  }

  private async init(): Promise<Enforcer> {
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
      true
    );

    const enforcer = await newEnforcer(modelPath, adapter);
    await enforcer.loadPolicy();
    enforcer.enableAutoSave(true);

    return enforcer;
  }

  async reloadPolicy(): Promise<void> {
    const enforcer = await this.enforcerPromise;
    await enforcer.loadPolicy();
  }

  async enforce(sub: unknown, obj: unknown, act: unknown, ctx?: unknown) {
    // Temp workaround
    await this.reloadPolicy();

    const enforcer = await this.enforcerPromise;

    console.log('Request:', { sub, obj, act, ctx });
    console.log('Policies:', await enforcer.getPolicy());

    const test = await enforcer.enforce(sub, obj, act, ctx);

    console.log('Result:', test);

    return test;
  }

  async getEnforcer(): Promise<Enforcer> {
    return this.enforcerPromise;
  }
}
