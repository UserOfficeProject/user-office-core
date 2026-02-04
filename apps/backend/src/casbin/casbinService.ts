/* eslint-disable no-console */
import path from 'path';

import { Enforcer, newEnforcer } from 'casbin';
import { SequelizeAdapter } from 'casbin-sequelize-adapter';
import { parse } from 'pg-connection-string';
import { container, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CasbinConditionDataSource } from '../datasources/CasbinConditionDataSource';
import { evalCondition } from './customFunctions';

@injectable()
export class CasbinService {
  private enforcerPromise?: Promise<Enforcer>;

  private casbinConditionDataSource =
    container.resolve<CasbinConditionDataSource>(
      Tokens.CasbinConditionDataSource
    );

  constructor() {}

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
    enforcer.addFunction('evalCondition', evalCondition);

    await enforcer.loadPolicy();
    enforcer.enableAutoSave(true);

    return enforcer;
  }

  private getEnforcer(): Promise<Enforcer> {
    if (!this.enforcerPromise) {
      this.enforcerPromise = this.init();
    }

    return this.enforcerPromise;
  }

  async reloadPolicy(): Promise<void> {
    const enforcer = await this.getEnforcer();
    await enforcer.loadPolicy();
  }

  async enforce(sub: unknown, obj: unknown, act: unknown): Promise<boolean> {
    // Temp workaround
    await this.reloadPolicy();

    const enforcer = await this.getEnforcer();

    console.log('Request:', { sub, obj, act });
    console.log('Policies:', await enforcer.getPolicy());

    const result = await enforcer.enforce(sub, obj, act, {});

    console.log('Result:', result);

    return result;
  }

  // Get the entire policies matching the role, object, and action
  async getPoliciesMatching(
    role: string,
    obj: string,
    act: string
  ): Promise<string[][]> {
    return (await this.getEnforcer()).getFilteredPolicy(0, role, obj, act);
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

  async addPolicyWithCondition(
    role: string,
    obj: string,
    act: string,
    conditionJson: string,
    allowOrDeny: string
  ): Promise<boolean> {
    const conditionRecord =
      await this.casbinConditionDataSource.create(conditionJson);

    return (await this.getEnforcer()).addPolicy(
      role,
      obj,
      act,
      String(conditionRecord.id),
      allowOrDeny
    );
  }
}
