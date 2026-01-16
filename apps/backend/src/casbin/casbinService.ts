/* eslint-disable no-console */
import path from 'path';

import { Enforcer, newEnforcer } from 'casbin';
import { SequelizeAdapter } from 'casbin-sequelize-adapter';
import { parse } from 'pg-connection-string';
import { injectable } from 'tsyringe';

import { hasTag } from './customFunctions';

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
      false
    );

    const enforcer = await newEnforcer(modelPath, adapter);

    // Custom function
    enforcer.addFunction('hasTag', hasTag);

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

    const result = await enforcer.enforce(sub, obj, act, ctx);

    console.log('Result:', result);

    return result;
  }

  async getEnforcer(): Promise<Enforcer> {
    return this.enforcerPromise;
  }

  // Get the entire policies matching the role, object, and action
  async getPoliciesMatching(
    role: string,
    obj: string,
    act: string
  ): Promise<string[][]> {
    return (await this.enforcerPromise).getFilteredPolicy(0, role, obj, act);
  }

  // Get the condition with matching text from the policies matching the role, object, and action
  async getPolicyConditionMatching(
    role: string,
    obj: string,
    act: string,
    searchText: string
  ): Promise<string | null> {
    const policies = await this.getPoliciesMatching(role, obj, act);

    return (
      policies.map((p) => p[3]).find((c) => !!c && c.includes(searchText)) ??
      null
    );
  }
}
