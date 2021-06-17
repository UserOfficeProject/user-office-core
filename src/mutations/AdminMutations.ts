import { logger } from '@esss-swap/duo-logger';
import {
  setPageTextValidationSchema,
  createApiAccessTokenValidationSchema,
  updateApiAccessTokenValidationSchema,
} from '@esss-swap/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Page } from '../models/Admin';
import { Institution } from '../models/Institution';
import { Rejection, rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { Unit } from '../models/Unit';
import { UserWithRole } from '../models/User';
import { CreateApiAccessTokenInput } from '../resolvers/mutations/CreateApiAccessTokenMutation';
import { CreateInstitutionsArgs } from '../resolvers/mutations/CreateInstitutionsMutation';
import { CreateUnitArgs } from '../resolvers/mutations/CreateUnitMutation';
import { DeleteApiAccessTokenInput } from '../resolvers/mutations/DeleteApiAccessTokenMutation';
import { UpdateApiAccessTokenInput } from '../resolvers/mutations/UpdateApiAccessTokenMutation';
import { UpdateInstitutionsArgs } from '../resolvers/mutations/UpdateInstitutionsMutation';
import { generateUniqueId } from '../utils/helperFunctions';
import { signToken } from '../utils/jwt';

const IS_BACKEND_VALIDATION = true;
@injectable()
export default class AdminMutations {
  constructor(
    @inject(Tokens.AdminDataSource) private dataSource: AdminDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async resetDB(
    agent: UserWithRole | null,
    includeSeeds: boolean
  ): Promise<string | Rejection> {
    if (process.env.NODE_ENV === 'development') {
      logger.logWarn('Resetting database', {});

      return this.dataSource.resetDB(includeSeeds);
    } else {
      return rejection('Resetting database is not allowed');
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async applyPatches(agent: UserWithRole | null): Promise<string | Rejection> {
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
      return rejection('Could not retrieve institutions');
    }

    institution.name = args.name ?? institution.name;
    institution.verified = args.verified ?? institution.verified;

    return await this.dataSource.updateInstitution(institution);
  }

  @Authorized([Roles.USER_OFFICER])
  async createInstitutions(
    agent: UserWithRole | null,
    args: CreateInstitutionsArgs
  ) {
    const institution = new Institution(0, args.name, args.verified);

    return await this.dataSource.createInstitution(institution);
  }

  @Authorized([Roles.USER_OFFICER])
  async createUnit(agent: UserWithRole | null, args: CreateUnitArgs) {
    const unit = new Unit(0, args.name);

    return await this.dataSource.createUnit(unit);
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteUnit(agent: UserWithRole | null, id: number) {
    return await this.dataSource.deleteUnit(id);
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
}
