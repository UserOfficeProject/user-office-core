import { Page } from '../models/Admin';
import { Feature } from '../models/Feature';
import { Institution } from '../models/Institution';
import { Permissions } from '../models/Permissions';
import { Unit } from '../models/Unit';
import { BasicUserDetails } from '../models/User';
import { CreateApiAccessTokenInput } from '../resolvers/mutations/CreateApiAccessTokenMutation';
import { UpdateApiAccessTokenInput } from '../resolvers/mutations/UpdateApiAccessTokenMutation';
import { InstitutionsFilter } from './../resolvers/queries/InstitutionsQuery';

export interface AdminDataSource {
  getInstitution(id: number): Promise<Institution | null>;
  createInstitution(institution: Institution): Promise<Institution | null>;
  updateInstitution(institution: Institution): Promise<Institution | null>;
  deleteInstitution(id: number): Promise<Institution>;
  getInstitutions(filter?: InstitutionsFilter): Promise<Institution[]>;
  getInstitutionUsers(id: number): Promise<BasicUserDetails[]>;
  getCountries(): Promise<Entry[]>;
  getNationalities(): Promise<Entry[]>;
  get(id: number): Promise<string | null>;
  setPageText(id: number, text: string): Promise<Page>;
  resetDB(): Promise<string>;
  applyPatches(): Promise<string>;
  getFeatures(): Promise<Feature[]>;
  createUnit(unit: Unit): Promise<Unit | null>;
  deleteUnit(id: number): Promise<Unit>;
  getUnits(): Promise<Unit[]>;
  createApiAccessToken(
    args: CreateApiAccessTokenInput,
    accessTokenId: string,
    accessToken: string
  ): Promise<Permissions>;
  updateApiAccessToken(args: UpdateApiAccessTokenInput): Promise<Permissions>;
  getTokenAndPermissionsById(accessTokenId: string): Promise<Permissions>;
  getAllTokensAndPermissions(): Promise<Permissions[]>;
  deleteApiAccessToken(accessTokenId: string): Promise<boolean>;
}
export class Entry {
  constructor(public id: number, public value: string) {}
}
