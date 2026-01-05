import path from 'path';

import { newEnforcer, Enforcer } from 'casbin';
import PostgresAdapter from 'casbin-pg-adapter';

let enforcerPromise: Promise<Enforcer> | null = null;

export function getEnforcer(): Promise<Enforcer> {
  if (!enforcerPromise) {
    enforcerPromise = (async () => {
      const connectionString = process.env.DATABASE_URL;

      // Use the adapter's static factory
      const adapter = await PostgresAdapter.newAdapter({ connectionString });

      const modelPath = path.resolve(__dirname, 'model.conf');
      const e = await newEnforcer(modelPath, adapter);
      await e.loadPolicy();
      e.enableLog(false);

      return e;
    })();
  }

  return enforcerPromise;
}
