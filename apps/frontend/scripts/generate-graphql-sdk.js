import 'dotenv/config'; // same as require('dotenv').config()

import path from 'path';
import { fileURLToPath } from 'url';

import { generate, loadContext } from '@graphql-codegen/cli';

// recreate __dirname in ESM
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

async function generateSdk() {
  const ctx = await loadContext(
    path.join(dirname, '..', 'codegen_template.yml')
  );

  await generate(ctx);
}

generateSdk().catch((e) => {
  // error text is printed by the codegen tool in most cases
  // print error only if it's something unrelated to codegen
  // or we running in CI
  if (e.name !== 'ListrError' || process.env.CI === 'true') {
    console.error(e);
  }
  process.exit(1);
});
