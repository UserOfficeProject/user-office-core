import { promises as fs } from 'fs';
import { cwd, env, exit } from 'node:process';
import path from 'path';

import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { injectable } from 'tsyringe';

import { Page } from '../../models/Admin';
import { Feature, FeatureUpdateAction } from '../../models/Feature';
import { Institution } from '../../models/Institution';
import { Permissions } from '../../models/Permissions';
import { Settings } from '../../models/Settings';
import { BasicUserDetails } from '../../models/User';
import { CreateApiAccessTokenInput } from '../../resolvers/mutations/CreateApiAccessTokenMutation';
import { CreateInstitutionsArgs } from '../../resolvers/mutations/CreateInstitutionsMutation';
import { MergeInstitutionsInput } from '../../resolvers/mutations/MergeInstitutionsMutation';
import { UpdateFeaturesInput } from '../../resolvers/mutations/settings/UpdateFeaturesMutation';
import { UpdateSettingsInput } from '../../resolvers/mutations/settings/UpdateSettingMutation';
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

const dbPatchesFolderPath = path.join(cwd(), 'db_patches');
const seedsPath = path.join(dbPatchesFolderPath, 'db_seeds');

@injectable()
export default class PostgresAdminDataSource implements AdminDataSource {
  private autoUpgradedDBReady = false;

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
      return null;
    }

    return createInstitutionObject(institutionRecord);
  }

  async createInstitution(
    institution: CreateInstitutionsArgs
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
      return null;
    }

    return createInstitutionObject(institutionRecord);
  }

  async deleteInstitution(id: number): Promise<Institution | null> {
    const [institutionRecord]: InstitutionRecord[] = await database(
      'institutions'
    )
      .where('institutions.institution_id', id)
      .del()
      .from('institutions')
      .returning('*');

    if (!institutionRecord) {
      return null;
    }

    return createInstitutionObject(institutionRecord);
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
      throw new GraphQLError(`Could not update page with id:${id}`);
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
        if (filter?.name) {
          query.where('institution', filter.name);
        }
      })
      .then((intDB: InstitutionRecord[]) =>
        intDB.map((int) => createInstitutionObject(int))
      );
  }

  async getInstitution(id: number): Promise<Institution | null> {
    return database
      .select('*')
      .from('institutions')
      .where('institution_id', id)
      .first()
      .then((int?: InstitutionRecord) => {
        if (!int) {
          return null;
        }

        return createInstitutionObject(int);
      });
  }

  async getInstitutionUsers(id: number): Promise<BasicUserDetails[]> {
    return database
      .select()
      .from('users')
      .where('institution', id)
      .then((users: Array<UserRecord & InstitutionRecord>) =>
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

      if (env.INCLUDE_SEEDS === '1' || includeSeeds) {
        await this.applySeeds();
      }

      return applyPatchesOutput;
    } catch (e) {
      logger.logException('resetDB failed', e);

      throw e;
    }
  }

  async applyPatches(): Promise<string[]> {
    logger.logInfo('Applying patches started', { timestamp: new Date() });

    const files = await fs.readdir(dbPatchesFolderPath);

    const patches = await Promise.all(
      files
        .filter((file) => /\.sql$/i.test(file))
        .sort()
        .map(async (file) => {
          const content = await fs.readFile(
            path.join(dbPatchesFolderPath, file),
            'utf8'
          );

          return [file, content];
        })
    );

    if (patches.length > 0) {
      await database.transaction(async (trx) => {
        for (const [file, patch] of patches) {
          await database
            .raw(patch)
            .transacting(trx)
            .catch((err) => {
              logger.logException('Failed to apply patch', err, { file });
              throw err;
            });
        }
      });
    }

    logger.logInfo('Applying patches finished', { timestamp: new Date() });

    return patches.map(([file]) => file);
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
        .then(() => (this.autoUpgradedDBReady = true))
        .catch((e) => {
          initDbFailed++;

          logger.logException('Failed to initialize db', e, { initDbFailed });

          if (initDbFailed >= 5) {
            exit(1);
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

  async createSetting(setting: Settings): Promise<Settings> {
    return database
      .insert({
        settings_id: setting.id,
        settings_value: setting.settingsValue,
        description: setting.description,
      })
      .into('settings')
      .returning('*')
      .then((settings: SettingsRecord[]) => createSettingsObject(settings[0]));
  }

  async getSettings(): Promise<Settings[]> {
    return database
      .select()
      .from('settings')
      .then((settings: SettingsRecord[]) =>
        settings.map((settings) => createSettingsObject(settings))
      );
  }

  async getSetting(id: SettingsId): Promise<Settings | null> {
    return database
      .select()
      .from('settings')
      .where('settings_id', id)
      .first()
      .then((setting: SettingsRecord) =>
        setting ? createSettingsObject(setting) : null
      );
  }

  async getTokenAndPermissionsById(
    accessTokenId: string
  ): Promise<Permissions> {
    const [permissionRules]: TokensAndPermissionsRecord[] = await database
      .select()
      .from('api_permissions')
      .where('access_token_id', accessTokenId);

    if (!permissionRules) {
      throw new GraphQLError(
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
      throw new GraphQLError(
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
      throw new GraphQLError(
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
    updatedSettingsInput: UpdateSettingsInput
  ): Promise<Settings> {
    const { settingsId, description, settingsValue } = updatedSettingsInput;

    const setting = await this.getSetting(settingsId);
    if (!setting) {
      await this.createSetting({
        id: settingsId as SettingsId,
        settingsValue: '',
        description: '',
      });
    }

    return database('settings')
      .update({ settings_value: settingsValue, description: description })
      .where('settings_id', settingsId)
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
      throw new GraphQLError(
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
      throw new GraphQLError(
        `Could not find institution to merge with id: ${args.institutionIdFrom}`
      );
    }

    const [institutionInto]: InstitutionRecord[] = await database
      .select()
      .from('institutions')
      .where('institution_id', args.institutionIdInto);

    if (!institutionInto) {
      throw new GraphQLError(
        `Could not find institution with id: ${args.institutionIdInto}`
      );
    }

    return await database
      .transaction(async (trx) => {
        await trx('users')
          .update({ institution: args.institutionIdInto })
          .where('institution', args.institutionIdFrom);

        await trx('institutions')
          .del()
          .where('institution_id', args.institutionIdFrom);
      })
      .then(() => {
        return createInstitutionObject(institutionInto);
      })
      .catch((e) => {
        throw new GraphQLError(`Failed to merge institutions: ${e}`);
      });
  }

  waitForDBUpgrade(): Promise<void> {
    return new Promise<void>((res, rej) => {
      const checkUpdate = () => {
        if (this.autoUpgradedDBReady) return res();
        setTimeout(checkUpdate, 30);
      };

      checkUpdate();
    });
  }

  async updateRoleTitle(rolesToUpdate: {
    shortCode: string;
    title: string;
  }): Promise<void> {
    const { shortCode, title } = rolesToUpdate;

    await database('roles')
      .update({ title: title })
      .where('short_code', shortCode);
  }
}

export class PostgresAdminDataSourceWithAutoUpgrade extends PostgresAdminDataSource {
  constructor() {
    super();
    this.upgrade();
  }
}
