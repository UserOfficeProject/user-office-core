import { promises as fs } from 'fs';
import path from 'path';

import { logger } from '@esss-swap/duo-logger';

import { Page } from '../../models/Admin';
import { Feature } from '../../models/Feature';
import { Institution } from '../../models/Institution';
import { Permissions } from '../../models/Permissions';
import { Unit } from '../../models/Unit';
import { BasicUserDetails } from '../../models/User';
import { CreateApiAccessTokenInput } from '../../resolvers/mutations/CreateApiAccessTokenMutation';
import { UpdateApiAccessTokenInput } from '../../resolvers/mutations/UpdateApiAccessTokenMutation';
import { AdminDataSource, Entry } from '../AdminDataSource';
import { InstitutionsFilter } from './../../resolvers/queries/InstitutionsQuery';
import database from './database';
import {
  CountryRecord,
  createBasicUserObject,
  createFeatureObject,
  createPageObject,
  FeatureRecord,
  InstitutionRecord,
  NationalityRecord,
  PageTextRecord,
  TokensAndPermissionsRecord,
  UserRecord,
  UnitRecord,
} from './records';

const dbPatchesFolderPath = path.join(process.cwd(), 'db_patches');
const seedsPath = path.join(dbPatchesFolderPath, 'db_seeds');

export default class PostgresAdminDataSource implements AdminDataSource {
  constructor() {
    if (
      process.env.NODE_ENV === 'test' || // don't run db init while running unit tests
      process.env.SKIP_DB_INIT === '1' // don't run db init in e2e tests
    ) {
      logger.logInfo('Skipping db initialization', {
        NODE_ENV: process.env.NODE_ENV,
        SKIP_DB_INIT: process.env.SKIP_DB_INIT,
      });

      return;
    }

    this.initDb();
  }

  async createUnit(unit: Unit): Promise<Unit | null> {
    const [unitRecord]: UnitRecord[] = await database
      .insert({
        unit: unit.name,
      })
      .into('units')
      .returning('*');

    if (!unitRecord) {
      throw new Error('Could not create unit');
    }

    return {
      id: unitRecord.unit_id,
      name: unitRecord.unit,
    };
  }

  async deleteUnit(id: number): Promise<Unit> {
    const [unitRecord]: UnitRecord[] = await database('units')
      .where('units.unit_id', id)
      .del()
      .from('units')
      .returning('*');

    if (!unitRecord) {
      throw new Error(`Could not delete unit with id:${id}`);
    }

    return {
      id: unitRecord.unit_id,
      name: unitRecord.unit,
    };
  }
  async getUnits(): Promise<Unit[]> {
    return await database
      .select()
      .from('units')
      .orderBy('unit', 'asc')
      .then((intDB: UnitRecord[]) =>
        intDB.map((int) => {
          return {
            id: int.unit_id,
            name: int.unit,
          };
        })
      );
  }
  async updateInstitution(
    institution: Institution
  ): Promise<Institution | null> {
    const [institutionRecord]: InstitutionRecord[] = await database
      .update({
        institution: institution.name,
        verified: institution.verified,
      })
      .from('institutions')
      .where('institution_id', institution.id)
      .returning('*');

    if (!institutionRecord) {
      throw new Error(`Could not update page with id:${institution.id}`);
    }

    return {
      id: institutionRecord.institution_id,
      name: institutionRecord.institution,
      verified: institutionRecord.verified,
    };
  }

  async createInstitution(
    institution: Institution
  ): Promise<Institution | null> {
    const [institutionRecord]: InstitutionRecord[] = await database
      .insert({
        institution: institution.name,
        verified: institution.verified,
      })
      .into('institutions')
      .returning('*');

    if (!institutionRecord) {
      throw new Error('Could not create call');
    }

    return {
      id: institutionRecord.institution_id,
      name: institutionRecord.institution,
      verified: institutionRecord.verified,
    };
  }

  async deleteInstitution(id: number): Promise<Institution> {
    const [institutionRecord]: InstitutionRecord[] = await database(
      'institutions'
    )
      .where('institutions.institution_id', id)
      .del()
      .from('institutions')
      .returning('*');

    if (!institutionRecord) {
      throw new Error(`Could not delete institution with id:${id}`);
    }

    return {
      id: institutionRecord.institution_id,
      name: institutionRecord.institution,
      verified: institutionRecord.verified,
    };
  }

  async get(id: number): Promise<string | null> {
    return database
      .select('content')
      .from('pagetext')
      .where('pagetext_id', id)
      .first()
      .then((res) => (res ? res.content : null));
  }

  async setPageText(id: number, content: string): Promise<Page> {
    const [pagetextRecord]: PageTextRecord[] = await database
      .update({
        content,
      })
      .from('pagetext')
      .where('pagetext_id', id)
      .returning('*');

    if (!pagetextRecord) {
      throw new Error(`Could not update page with id:${id}`);
    }

    return createPageObject(pagetextRecord);
  }

  async getNationalities(): Promise<Entry[]> {
    return database
      .select()
      .from('nationalities')
      .then((natDB: NationalityRecord[]) =>
        natDB.map((nat) => {
          return { id: nat.nationality_id, value: nat.nationality };
        })
      );
  }

  async getInstitutions(filter: InstitutionsFilter): Promise<Institution[]> {
    return database
      .select()
      .from('institutions')
      .orderByRaw('institution_id=1 desc')
      .orderBy('institution', 'asc')
      .modify((query) => {
        if (filter?.isVerified) {
          query.where('verified', filter.isVerified);
        }
      })
      .then((intDB: InstitutionRecord[]) =>
        intDB.map((int) => {
          return {
            id: int.institution_id,
            name: int.institution,
            verified: int.verified,
          };
        })
      );
  }

  async getInstitution(id: number): Promise<Institution | null> {
    return database
      .select('*')
      .from('institutions')
      .where('institution_id', id)
      .first()
      .then(
        (int: InstitutionRecord) =>
          new Institution(int.institution_id, int.institution, int.verified)
      );
  }

  async getInstitutionUsers(id: number): Promise<BasicUserDetails[]> {
    return database
      .select()
      .from('users')
      .where('organisation', id)
      .then((users: UserRecord[]) =>
        users.map((user) => createBasicUserObject(user))
      );
  }

  async getCountries(): Promise<Entry[]> {
    return database
      .select()
      .from('countries')
      .then((countDB: CountryRecord[]) =>
        countDB.map((count) => {
          return { id: count.country_id, value: count.country };
        })
      );
  }

  /**
   * NB! This will actually wipe the database
   */
  async resetDB(includeSeeds: boolean) {
    try {
      await database.raw(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO duouser;
        GRANT ALL ON SCHEMA public TO public;
      `);

      const applyPatchesOutput = await this.applyPatches();

      if (process.env.INCLUDE_SEEDS === '1' || includeSeeds) {
        await this.applySeeds();
      }

      return applyPatchesOutput;
    } catch (e) {
      logger.logException('resetDB failed', e);

      throw e;
    }
  }

  async applyPatches(): Promise<string> {
    logger.logInfo('Applying patches started', { timestamp: new Date() });

    const log: string[] = [];

    const files = await fs.readdir(dbPatchesFolderPath);

    for (const file of files) {
      // ignore everything other than sql files
      if (!/\.sql$/i.test(file)) {
        continue;
      }

      const contents = await fs.readFile(
        path.join(dbPatchesFolderPath, file),
        'utf8'
      );
      await database
        .raw(contents)
        .then(() => {
          const msg = `${file} executed.`;
          log.push(msg);
        })
        .catch((err) => {
          const msg = `${file} failed: ${err}`;
          log.push(msg);

          throw log.join('\n');
        });
    }

    logger.logInfo('Applying patches finished', {});

    return log.join('\n');
  }

  private async applySeeds() {
    logger.logInfo('Applying seeds started', { timestamp: new Date() });

    const log: string[] = [];

    const files = await fs.readdir(seedsPath);

    for (const file of files) {
      // ignore everything other than sql files
      if (!/\.sql$/i.test(file)) {
        continue;
      }

      const contents = await fs.readFile(path.join(seedsPath, file), 'utf8');
      await database
        .raw(contents)
        .then(() => {
          const msg = `${file} executed.`;
          log.push(msg);
        })
        .catch((err) => {
          const msg = `${file} failed. ${err}`;
          log.push(msg);

          throw log;
        });
    }

    logger.logInfo('Applying seeds finished', {});
  }

  private async initDb() {
    let initDbFailed = 0;

    const initDb = () => {
      database('pg_stat_activity')
        .count('*', { as: 'total' })
        .select('state')
        .groupBy(2)
        .then(() => this.applyPatches())
        .catch((e) => {
          initDbFailed++;

          logger.logException('Failed to initialize db', e, { initDbFailed });

          if (initDbFailed >= 5) {
            process.exit(1);
          }

          setTimeout(initDb, 1000);
        });
    };

    setTimeout(initDb, 500);
  }

  async getFeatures(): Promise<Feature[]> {
    return database
      .select()
      .from('features')
      .then((features: FeatureRecord[]) =>
        features.map((feature) => createFeatureObject(feature))
      );
  }

  async getTokenAndPermissionsById(
    accessTokenId: string
  ): Promise<Permissions> {
    const [
      permissionRules,
    ]: TokensAndPermissionsRecord[] = await database
      .select()
      .from('api_permissions')
      .where('access_token_id', accessTokenId);

    if (!permissionRules) {
      throw new Error(
        `Could not find permission rules for access token key: ${accessTokenId}`
      );
    }

    return new Permissions(
      permissionRules.access_token_id,
      permissionRules.name,
      permissionRules.access_token,
      JSON.stringify(permissionRules.access_permissions)
    );
  }

  async getAllTokensAndPermissions(): Promise<Permissions[]> {
    const accessTokensWithPermissions: TokensAndPermissionsRecord[] = await database
      .select()
      .from('api_permissions');

    return accessTokensWithPermissions.map(
      (accessTokenWithPermissions) =>
        new Permissions(
          accessTokenWithPermissions.access_token_id,
          accessTokenWithPermissions.name,
          accessTokenWithPermissions.access_token,
          JSON.stringify(accessTokenWithPermissions.access_permissions)
        )
    );
  }

  async createApiAccessToken(
    args: CreateApiAccessTokenInput,
    accessTokenId: string,
    accessToken: string
  ): Promise<Permissions> {
    const [permissionRules]: TokensAndPermissionsRecord[] = await database
      .insert({
        access_token_id: accessTokenId,
        name: args.name,
        access_token: accessToken,
        access_permissions: args.accessPermissions,
      })
      .into('api_permissions')
      .returning('*');

    if (!permissionRules) {
      throw new Error(
        `Could not insert permission rules with access token key:${accessTokenId}`
      );
    }

    return new Permissions(
      permissionRules.access_token_id,
      permissionRules.name,
      permissionRules.access_token,
      JSON.stringify(permissionRules.access_permissions)
    );
  }

  async updateApiAccessToken(
    args: UpdateApiAccessTokenInput
  ): Promise<Permissions> {
    const [permissionRules]: TokensAndPermissionsRecord[] = await database(
      'api_permissions'
    )
      .update({
        name: args.name,
        access_permissions: args.accessPermissions,
      })
      .where('access_token_id', args.accessTokenId)
      .returning('*');

    if (!permissionRules) {
      throw new Error(
        `Could not update permission rules with access token key: ${args.accessTokenId}`
      );
    }

    return new Permissions(
      permissionRules.access_token_id,
      permissionRules.name,
      permissionRules.access_token,
      JSON.stringify(permissionRules.access_permissions)
    );
  }

  async deleteApiAccessToken(accessTokenId: string): Promise<boolean> {
    const [apiAccessTokenRecord]: TokensAndPermissionsRecord[] = await database(
      'api_permissions'
    )
      .del()
      .where('access_token_id', accessTokenId)
      .returning('*');

    if (!apiAccessTokenRecord) {
      throw new Error(
        `Could not delete api access token with id: ${accessTokenId}`
      );
    }

    return true;
  }
}
