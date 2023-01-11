import { Page } from '../models/Admin';
import { Entry } from '../models/Entry';
import { Feature, FeatureId } from '../models/Feature';
import { Institution } from '../models/Institution';
import { Permissions } from '../models/Permissions';
import { Settings, SettingsId } from '../models/Settings';
import { BasicUserDetails } from '../models/User';
import { CreateApiAccessTokenInput } from '../resolvers/mutations/CreateApiAccessTokenMutation';
import { CreateInstitutionsArgs } from '../resolvers/mutations/CreateInstitutionsMutation';
import { MergeInstitutionsInput } from '../resolvers/mutations/MergeInstitutionsMutation';
import { UpdateFeaturesInput } from '../resolvers/mutations/settings/UpdateFeaturesMutation';
import { UpdateSettingsInput } from '../resolvers/mutations/settings/UpdateSettingMutation';
import { UpdateApiAccessTokenInput } from '../resolvers/mutations/UpdateApiAccessTokenMutation';
import { InstitutionsFilter } from './../resolvers/queries/InstitutionsQuery';

export interface AdminDataSource {
  getCountry(id: number): Promise<Entry | null>;
  getInstitution(id: number): Promise<Institution | null>;
  createInstitution(
    institutionInput: CreateInstitutionsArgs
  ): Promise<Institution | null>;
  updateInstitution(institution: Institution): Promise<Institution | null>;
  deleteInstitution(id: number): Promise<Institution | null>;
  mergeInstitutions(args: MergeInstitutionsInput): Promise<Institution | null>;
  getInstitutions(filter?: InstitutionsFilter): Promise<Institution[]>;
  getInstitutionUsers(id: number): Promise<BasicUserDetails[]>;
  getCountries(): Promise<Entry[]>;
  getNationalities(): Promise<Entry[]>;
  get(id: number): Promise<string | null>;
  setPageText(id: number, text: string): Promise<Page>;
  resetDB(includeSeeds: boolean): Promise<string>;
  applyPatches(): Promise<string>;
  getFeatures(): Promise<Feature[]>;
  setFeatures(features: FeatureId[], value: boolean): Promise<FeatureId[]>;
  updateFeatures(updatedFeaturesInput: UpdateFeaturesInput): Promise<Feature[]>;
  getSettings(): Promise<Settings[]>;
  getSetting(id: SettingsId): Promise<Settings | null>;
  createApiAccessToken(
    args: CreateApiAccessTokenInput,
    accessTokenId: string,
    accessToken: string
  ): Promise<Permissions>;
  updateApiAccessToken(args: UpdateApiAccessTokenInput): Promise<Permissions>;
  updateSettings(updatedSettingsInput: UpdateSettingsInput): Promise<Settings>;
  getTokenAndPermissionsById(accessTokenId: string): Promise<Permissions>;
  getAllTokensAndPermissions(): Promise<Permissions[]>;
  deleteApiAccessToken(accessTokenId: string): Promise<boolean>;
}
