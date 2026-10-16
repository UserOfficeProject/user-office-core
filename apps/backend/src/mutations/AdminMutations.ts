import { logger } from '@user-office-software/duo-logger';
import {
  setPageTextValidationSchema,
  createApiAccessTokenValidationSchema,
  updateApiAccessTokenValidationSchema,
} from '@user-office-software/duo-validation';
import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { RoleDataSource } from '../datasources/RoleDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Page } from '../models/Admin';
import { Feature } from '../models/Feature';
import { Institution } from '../models/Institution';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { Settings } from '../models/Settings';
import { UserWithRole } from '../models/User';
import { CreateApiAccessTokenInput } from '../resolvers/mutations/CreateApiAccessTokenMutation';
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
    @inject(Tokens.AdminDataSource) private adminDataSource: AdminDataSource,
    @inject(Tokens.RoleDataSource) private roleDataSource: RoleDataSource
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

      const log = await this.adminDataSource.resetDB(includeSeeds);
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

    return this.adminDataSource.applyPatches();
  }

  @ValidateArgs(setPageTextValidationSchema, ['text'])
  @Authorized([Roles.USER_OFFICER])
  async setPageText(
    agent: UserWithRole | null,
    { pageId, text, roleId }: { pageId: number; text: string; roleId?: number }
  ): Promise<Page | Rejection> {
    const agentRoleTagIds =
      agent?.currentRole?.id != null
        ? (
            await this.roleDataSource.getTagsByRoleId(agent?.currentRole?.id)
          ).map((t) => t.id)
        : [];
    const pageRoleTagIds =
      roleId != null
        ? (await this.roleDataSource.getTagsByRoleId(roleId)).map((t) => t.id)
        : [];

    //A derived user officer role is trying to edit the notice for a role they're not allowed to
    if (
      !agent?.currentRole?.isRootRole &&
      !agentRoleTagIds.filter((t) => pageRoleTagIds.includes(t)).length
    ) {
      return rejection('Insufficient permission to update page notice', {
        agent,
        pageId,
        roleId,
      });
    }

    return this.adminDataSource
      .setPageText(pageId, text, roleId)
      .then((page) => {
        return page;
      })
      .catch((error) => {
        return rejection(
          'Could not set page text',
          { agent, pageId, roleId },
          error
        );
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async updateInstitutions(
    agent: UserWithRole | null,
    args: UpdateInstitutionsArgs
  ) {
    const institution = await this.adminDataSource.getInstitution(args.id);
    if (!institution) {
      return rejection('Could not retrieve institution', {
        agent,
        code: ApolloServerErrorCodeExtended.NOT_FOUND,
      });
    }

    institution.name = args.name ?? institution.name;
    institution.country = args.country ?? institution.country;

    return await this.adminDataSource.updateInstitution(institution);
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteInstitutions(agent: UserWithRole | null, id: number) {
    const institution = await this.adminDataSource.getInstitution(id);
    if (!institution) {
      return rejection('Institution not found');
    }

    const institutionUsers = await this.adminDataSource.getInstitutionUsers(id);
    if (institutionUsers.length !== 0) {
      return rejection('There are users associated with this institution');
    }

    return await this.adminDataSource.deleteInstitution(id);
  }

  @Authorized()
  async addClientLog(agent: UserWithRole | null, error: string) {
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

    const result = await this.adminDataSource.createApiAccessToken(
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

      return await this.adminDataSource.updateApiAccessToken({
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
      return await this.adminDataSource.deleteApiAccessToken(
        args.accessTokenId
      );
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
    const institution = await this.adminDataSource.mergeInstitutions(args);

    if (!institution) {
      return rejection('Could not merge institutions', { agent, args });
    }

    const updatedInstitution = await this.adminDataSource.updateInstitution({
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
    const updatedFeatures = await this.adminDataSource.updateFeatures(args);

    if (!updatedFeatures.length) {
      return rejection('Could not update features', { agent, args });
    }

    return updatedFeatures;
  }

  @Authorized([Roles.USER_OFFICER])
  async updateSettings(
    agent: UserWithRole | null,
    args: UpdateSettingsInput
  ): Promise<Settings | Rejection> {
    const updatedSettings = await this.adminDataSource.updateSettings(args);

    if (!updatedSettings) {
      return rejection('Could not update settings', { agent, args });
    }

    return updatedSettings;
  }
}
