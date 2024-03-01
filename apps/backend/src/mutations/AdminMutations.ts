import { logger } from '@user-office-software/duo-logger';
import {
  setPageTextValidationSchema,
  createApiAccessTokenValidationSchema,
  updateApiAccessTokenValidationSchema,
} from '@user-office-software/duo-validation';
import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Page } from '../models/Admin';
import { Feature } from '../models/Feature';
import { Institution } from '../models/Institution';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { Settings } from '../models/Settings';
import { UserWithRole } from '../models/User';
import { CreateApiAccessTokenInput } from '../resolvers/mutations/CreateApiAccessTokenMutation';
import { CreateInstitutionsArgs } from '../resolvers/mutations/CreateInstitutionsMutation';
import { DeleteApiAccessTokenInput } from '../resolvers/mutations/DeleteApiAccessTokenMutation';
import { MergeInstitutionsInput } from '../resolvers/mutations/MergeInstitutionsMutation';
import { UpdateFeaturesInput } from '../resolvers/mutations/settings/UpdateFeaturesMutation';
import { UpdateSettingsInput } from '../resolvers/mutations/settings/UpdateSettingMutation';
import { UpdateApiAccessTokenInput } from '../resolvers/mutations/UpdateApiAccessTokenMutation';
import { UpdateInstitutionsArgs } from '../resolvers/mutations/UpdateInstitutionsMutation';
import { generateUniqueId, isProduction } from '../utils/helperFunctions';
import { signToken } from '../utils/jwt';
import { ApolloServerErrorCodeExtended } from '../utils/utilTypes';

const IS_BACKEND_VALIDATION = true;
@injectable()
export default class AdminMutations {
  constructor(
    @inject(Tokens.AdminDataSource) private dataSource: AdminDataSource,
    @inject(Tokens.MapFeatureFlaggedConfig)
    private featureFlaggedConfig: () => void
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async resetDB(
    agent: UserWithRole | null,
    includeSeeds: boolean
  ): Promise<string[] | Rejection> {
    if (isProduction) {
      return rejection('Resetting database is not allowed');
    } else {
      logger.logWarn('Resetting database', {});

      const log = await this.dataSource.resetDB(includeSeeds);
      await container.resolve<() => Promise<void>>(
        Tokens.ConfigureEnvironment
      )();

      return log;
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async applyPatches(
    agent: UserWithRole | null
  ): Promise<string[] | Rejection> {
    logger.logWarn('Applying patches', {});

    return this.dataSource.applyPatches();
  }

  @ValidateArgs(setPageTextValidationSchema, ['text'])
  @Authorized([Roles.USER_OFFICER])
  async setPageText(
    agent: UserWithRole | null,
    { id, text }: { id: number; text: string }
  ): Promise<Page | Rejection> {
    return this.dataSource
      .setPageText(id, text)
      .then((page) => {
        return page;
      })
      .catch((error) => {
        return rejection('Could not set page text', { agent, id }, error);
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async updateInstitutions(
    agent: UserWithRole | null,
    args: UpdateInstitutionsArgs
  ) {
    const institution = await this.dataSource.getInstitution(args.id);
    if (!institution) {
      return rejection('Could not retrieve institution', {
        agent,
        code: ApolloServerErrorCodeExtended.NOT_FOUND,
      });
    }

    institution.name = args.name ?? institution.name;
    institution.verified = args.verified ?? institution.verified;
    institution.country = args.country ?? institution.country;

    return await this.dataSource.updateInstitution(institution);
  }

  @Authorized([Roles.USER_OFFICER])
  async createInstitutions(
    agent: UserWithRole | null,
    args: CreateInstitutionsArgs
  ): Promise<Institution | Rejection> {
    const institution = await this.dataSource.createInstitution(args);

    if (!institution) {
      return rejection('Could not create institution');
    }

    return institution;
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteInstitutions(agent: UserWithRole | null, id: number) {
    const institution = await this.dataSource.getInstitution(id);
    if (!institution) {
      return rejection('Institution not found');
    }

    const institutionUsers = await this.dataSource.getInstitutionUsers(id);
    if (institutionUsers.length !== 0) {
      return rejection('There are users associated with this institution');
    }

    return await this.dataSource.deleteInstitution(id);
  }

  async addClientLog(error: string) {
    logger.logError('Error received from client', { error });

    return true;
  }

  @ValidateArgs(createApiAccessTokenValidationSchema(IS_BACKEND_VALIDATION))
  @Authorized([Roles.USER_OFFICER])
  async createApiAccessToken(
    agent: UserWithRole | null,
    args: CreateApiAccessTokenInput
  ) {
    const accessTokenId = generateUniqueId();
    const accessPermissions = JSON.parse(args.accessPermissions);
    const generatedAccessToken = signToken(
      { accessTokenId },
      { expiresIn: '100y' } // API access token should have long life
    );

    const result = await this.dataSource.createApiAccessToken(
      { accessPermissions, name: args.name },
      accessTokenId,
      generatedAccessToken
    );

    if (generatedAccessToken === result.accessToken) {
      return result;
    } else {
      return rejection('Could not generate access token');
    }
  }

  @ValidateArgs(updateApiAccessTokenValidationSchema(IS_BACKEND_VALIDATION))
  @Authorized([Roles.USER_OFFICER])
  async updateApiAccessToken(
    agent: UserWithRole | null,
    args: UpdateApiAccessTokenInput
  ) {
    try {
      const accessPermissions = JSON.parse(args.accessPermissions);

      return await this.dataSource.updateApiAccessToken({
        ...args,
        accessPermissions,
      });
    } catch (error) {
      return rejection(
        'Could not update api access token',
        { agent, args },
        error
      );
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteApiAccessToken(
    agent: UserWithRole | null,
    args: DeleteApiAccessTokenInput
  ) {
    try {
      return await this.dataSource.deleteApiAccessToken(args.accessTokenId);
    } catch (error) {
      return rejection(
        'Could not remove api access token',
        { agent, args },
        error
      );
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async mergeInstitutions(
    agent: UserWithRole | null,
    args: MergeInstitutionsInput
  ): Promise<Institution | Rejection> {
    const institution = await this.dataSource.mergeInstitutions(args);

    if (!institution) {
      return rejection('Could not merge institutions', { agent, args });
    }

    const updatedInstitution = await this.dataSource.updateInstitution({
      ...institution,
      name: args.newTitle,
    });

    if (!updatedInstitution) {
      return rejection('Could not update institution', { agent, args });
    }

    return updatedInstitution;
  }

  @Authorized([Roles.USER_OFFICER])
  async updateFeatures(
    agent: UserWithRole | null,
    args: UpdateFeaturesInput
  ): Promise<Feature[] | Rejection> {
    const updatedFeatures = await this.dataSource.updateFeatures(args);

    if (!updatedFeatures.length) {
      return rejection('Could not update features', { agent, args });
    }

    // NOTE: After feature update re-map the dependent config
    this.featureFlaggedConfig();

    return updatedFeatures;
  }

  @Authorized([Roles.USER_OFFICER])
  async updateSettings(
    agent: UserWithRole | null,
    args: UpdateSettingsInput
  ): Promise<Settings | Rejection> {
    const updatedSettings = await this.dataSource.updateSettings(args);

    if (!updatedSettings) {
      return rejection('Could not update settings', { agent, args });
    }

    return updatedSettings;
  }
}
