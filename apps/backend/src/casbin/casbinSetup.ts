import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { createCasbinEnforcer } from './casbinFactory';

export async function registerCasbin() {
  const enforcer = await createCasbinEnforcer();
  container.registerInstance(Tokens.CasbinEnforcer, enforcer);
}
