import { promises as fs } from 'fs';
import path from 'path';

import { logger } from '@user-office-software/duo-logger';
import { injectable } from 'tsyringe';

import { Page } from '../../models/Admin';
import { Feature, FeatureUpdateAction } from '../../models/Feature';
import { Institution } from '../../models/Institution';
import { Permissions } from '../../models/Permissions';
import { Settings } from '../../models/Settings';
import { BasicUserDetails } from '../../models/User';
import { CreateApiAccessTokenInput } from '../../resolvers/mutations/CreateApiAccessTokenMutation';
import { MergeInstitutionsInput } from '../../resolvers/mutations/MergeInstitutionsMutation';
import { UpdateFeaturesInput } from '../../resolvers/mutations/settings/UpdateFeaturesMutation';
import { UpdateApiAccessTokenInput } from '../../resolvers/mutations/UpdateApiAccessTokenMutation';
import { AdminDataSource } from '../AdminDataSource';
import { Entry } from './../../models/Entry';
import { FeatureId } from './../../models/Feature';
import { SettingsId } from './../../models/Settings';
import { InstitutionsFilter } from './../../resolvers/queries/InstitutionsQuery';
import database from './database';
import {
  CountryRecord,
  createBasicUserObject,
  createFeatureObject,
  createInstitutionObject,
  createPageObject,
  createSettingsObject,
  FeatureRecord,
  InstitutionRecord,
  NationalityRecord,
  PageTextRecord,
  SettingsRecord,
  TokensAndPermissionsRecord,
  UserRecord,
} from './records';

const dbPatchesFolderPath = path.join(process.cwd(), 'db_patches');
const seedsPath = path.join(dbPatchesFolderPath, 'db_seeds');

@injectable()
export default class PostgresAdminDataSource implements AdminDataSource {
  async getCountry(id: number): Promise<Entry | null> {
    return database
      .select('*')
      .from('countries')
      .where('country_id', id)
      .first()
      .then((country: CountryRecord) =>
        country ? new Entry(country.country_id, country.country) : null
      );
  }

  async updateInstitution(
    institution: Institution
  ): Promise<Institution | null> {
    const [institutionRecord]: InstitutionRecord[] = await database
      .update({
        institution: institution.name,
        verified: institution.verified,
        country_id: institution.country,
      })
      .from('institutions')
      .where('institution_id', institution.id)
      .returning('*');

    if (!institutionRecord) {
      throw new Error(`Could not update institution with id:${institution.id}`);
    }

    return {
      id: institutionRecord.institution_id,
      name: institutionRecord.institution,
      country: institutionRecord.country_id,
      verified: institutionRecord.verified,
    };
  }

  async createInstitution(
    institution: Institution
  ): Promise<Institution | null> {
    const [institutionRecord]: InstitutionRecord[] = await database
      .insert({
        institution: institution.name,
        country_id: institution.country,
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
      country: institutionRecord.country_id,
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
      country: institutionRecord.country_id,
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

  async setFeatures(
    features: FeatureId[],
    value: boolean
  ): Promise<FeatureId[]> {
    await database('features')
      .update({ is_enabled: value })
      .whereIn('feature_id', features);

    return features;
  }

  async updateFeatures(
    updatedFeaturesInput: UpdateFeaturesInput
  ): Promise<Feature[]> {
    const shouldEnable =
      updatedFeaturesInput.action === FeatureUpdateAction.ENABLE;

    const featureRecords: FeatureRecord[] = await database('features')
      .update({ is_enabled: shouldEnable })
      .whereIn('feature_id', updatedFeaturesInput.featureIds)
      .returning('*');

    return featureRecords.map((featureRecord) =>
      createFeatureObject(featureRecord)
    );
  }

  async setPageText(id: number, content: string): Promise<Page> {
    const [pagetextRecord]: PageTextRecord[] = await database('pagetext')
      .insert({
        pagetext_id: id,
        content: content,
      })
      .onConflict('pagetext_id')
      .merge()
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
            country: int.country_id,
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
          new Institution(
            int.institution_id,
            int.institution,
            int.country_id,
            int.verified
          )
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

  protected async upgrade() {
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

  async getSettings(): Promise<Settings[]> {
    return database
      .select()
      .from('settings')
      .then((settings: SettingsRecord[]) =>
        settings.map((settings) => createSettingsObject(settings))
      );
  }

  async getSetting(id: SettingsId): Promise<Settings> {
    return database
      .select()
      .from('settings')
      .where('setting_id', id)
      .first()
      .then((setting: SettingsRecord) => createSettingsObject(setting));
  }

  async getTokenAndPermissionsById(
    accessTokenId: string
  ): Promise<Permissions> {
    const [permissionRules]: TokensAndPermissionsRecord[] = await database
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
    const accessTokensWithPermissions: TokensAndPermissionsRecord[] =
      await database.select().from('api_permissions');

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

  async updateSettings(
    id: SettingsId,
    value?: string,
    description?: string
  ): Promise<Settings> {
    return database('settings')
      .update({ settings_value: value, description: description })
      .where('settings_id', id)
      .returning('*')
      .then((records: SettingsRecord[]) => createSettingsObject(records[0]));
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

  async mergeInstitutions(
    args: MergeInstitutionsInput
  ): Promise<Institution | null> {
    const [institutionFrom]: InstitutionRecord[] = await database
      .select()
      .from('institutions')
      .where('institution_id', args.institutionIdFrom);

    if (!institutionFrom) {
      throw new Error(
        `Could not find institution to merge with id: ${args.institutionIdFrom}`
      );
    }

    const [institutionInto]: InstitutionRecord[] = await database
      .select()
      .from('institutions')
      .where('institution_id', args.institutionIdInto);

    if (!institutionInto) {
      throw new Error(
        `Could not find institution with id: ${args.institutionIdInto}`
      );
    }

    return await database
      .transaction(async (trx) => {
        await trx('users')
          .update({ organisation: args.institutionIdInto })
          .where('organisation', args.institutionIdFrom);

        await trx('institutions')
          .del()
          .where('institution_id', args.institutionIdFrom);
      })
      .then(() => {
        return createInstitutionObject(institutionInto);
      })
      .catch((e) => {
        throw new Error(`Failed to merge institutions: ${e}`);
      });
  }
}

export class PostgresAdminDataSourceWithAutoUpgrade extends PostgresAdminDataSource {
  constructor() {
    super();
    this.upgrade();
  }
}
