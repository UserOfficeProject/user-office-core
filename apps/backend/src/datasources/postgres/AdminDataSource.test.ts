import 'reflect-metadata';
import { promises as fs } from 'fs';
import path from 'node:path';
import { cwd } from 'node:process';

import { container } from 'tsyringe';

import AdminDataSource from './AdminDataSource';
import database from './database';

const adminDataSource = container.resolve(AdminDataSource);

describe('AdminDataSource', () => {
  beforeEach(async () => {
    await database.raw('CREATE TABLE "db-patch-e2e-test" (value CHAR(1))');
  });

  afterEach(async () => {
    await database.raw('DROP TABLE IF EXISTS "db-patch-e2e-test"');
  });

  afterAll(async () => {
    await database.destroy();
    await Promise.all([
      fs.rm(dbPatchFilePath('a.sql')),
      fs.rm(dbPatchFilePath('b.sql')),
    ]);
  });

  describe('applyPatches', () => {
    it('should apply every patch', async () => {
      await createPatchFile(
        'a.sql',
        'INSERT INTO "db-patch-e2e-test" VALUES (\'a\');'
      );
      await createPatchFile(
        'b.sql',
        'INSERT INTO "db-patch-e2e-test" VALUES (\'b\');'
      );

      await adminDataSource.applyPatches();

      const values = await database('db-patch-e2e-test').select();

      expect(values).toEqual([{ value: 'a' }, { value: 'b' }]);
    });

    it('should not apply any patch if one fails', async () => {
      await createPatchFile(
        'a.sql',
        'INSERT INTO "db-patch-e2e-test" VALUES (\'a\');'
      );
      await createPatchFile('b.sql', 'WRONG QUERY');

      const res = await adminDataSource.applyPatches().catch((err) => err);

      expect(res).toEqual(
        new Error('WRONG QUERY - syntax error at or near "WRONG"')
      );

      const values = await database('db-patch-e2e-test').select();

      expect(values).toEqual([]);
    });
  });

  function dbPatchFilePath(name: string) {
    return path.join(cwd(), 'db_patches', name);
  }

  function createPatchFile(name: string, content: string) {
    return fs.writeFile(dbPatchFilePath(name), content);
  }
});
