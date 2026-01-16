import { createCasbinEnforcer } from './casbinFactory';

export async function registerCasbin() {
  await createCasbinEnforcer();
}
