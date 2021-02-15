import { Page } from '../../models/Admin';
import { Feature, FeatureId } from '../../models/Feature';
import { Institution } from '../../models/Institution';
import { Permissions } from '../../models/Permissions';
import { CreateApiAccessTokenInput } from '../../resolvers/mutations/CreateApiAccessTokenMutation';
import { UpdateApiAccessTokenInput } from '../../resolvers/mutations/UpdateApiAccessTokenMutation';
import { AdminDataSource, Entry } from '../AdminDataSource';

export const dummyInstitution = new Institution(1, 'ESS', true);
export const dummyApiAccessToken = new Permissions(
  'kkmgdyzpj26uxubxoyl',
  'ESS access token',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NUb2tlbklkIjoia2twNmNjeTRraGF6em9keWx4cyIsImlhdCI6MTYxMjM0MTIzNywiZXhwIjoxNjEyOTQ2MDM3fQ.C_x6WTWD_Jr7_UH4ff_oJGPNnhAJhOFW-EfOMppUTbc',
  '{"ProposalQueries.getAll": true}'
);

export const dummyApiAccessTokens = [dummyApiAccessToken];

export class AdminDataSourceMock implements AdminDataSource {
  async getInstitutionUsers(
    id: number
  ): Promise<import('../../models/User').BasicUserDetails[]> {
    return [];
  }
  async getInstitution(
    id: number
  ): Promise<import('../../models/Institution').Institution | null> {
    return dummyInstitution;
  }
  async createInstitution(
    institution: import('../../models/Institution').Institution
  ): Promise<import('../../models/Institution').Institution | null> {
    return dummyInstitution;
  }

  async updateInstitution(
    institution: import('../../models/Institution').Institution
  ): Promise<import('../../models/Institution').Institution | null> {
    return dummyInstitution;
  }

  async deleteInstitution(
    id: number
  ): Promise<import('../../models/Institution').Institution> {
    return dummyInstitution;
  }

  async getInstitutions(
    filter?:
      | import('../../resolvers/queries/InstitutionsQuery').InstitutionsFilter
      | undefined
  ): Promise<import('../../models/Institution').Institution[]> {
    return [dummyInstitution];
  }
  applyPatches(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async resetDB(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async getCountries(): Promise<Entry[]> {
    throw new Error('Method not implemented.');
  }
  async getNationalities(): Promise<Entry[]> {
    throw new Error('Method not implemented.');
  }
  async get(id: number): Promise<string | null> {
    return 'HELLO WORLD';
  }
  async setPageText(id: number, text: string) {
    return new Page(id, text);
  }
  async getFeatures(): Promise<Feature[]> {
    return [{ id: FeatureId.SHIPPING, isEnabled: false, description: '' }];
  }

  async getTokenAndPermissionsById(
    accessTokenId: string
  ): Promise<Permissions> {
    return dummyApiAccessToken;
  }

  async getAllTokensAndPermissions(): Promise<Permissions[]> {
    return dummyApiAccessTokens;
  }

  async createApiAccessToken(
    args: CreateApiAccessTokenInput,
    accessTokenId: string,
    accessToken: string
  ): Promise<Permissions> {
    return new Permissions(
      accessTokenId,
      args.name,
      accessToken,
      args.accessPermissions
    );
  }

  async updateApiAccessToken(
    args: UpdateApiAccessTokenInput
  ): Promise<Permissions> {
    const apiAccessToken = dummyApiAccessTokens.find(
      accessToken => accessToken.id === args.accessTokenId
    );

    if (!apiAccessToken) {
      throw new Error(
        `Could not update permission rules with access token key: ${args.accessTokenId}`
      );
    }

    apiAccessToken.accessPermissions = args.accessPermissions;
    apiAccessToken.name = args.name;

    return apiAccessToken;
  }

  async deleteApiAccessToken(accessTokenId: string): Promise<boolean> {
    return true;
  }
}
