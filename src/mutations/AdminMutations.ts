import { logger } from '@esss-swap/duo-logger';
import {
  setPageTextValidationSchema,
  createApiAccessTokenValidationSchema,
  updateApiAccessTokenValidationSchema,
} from '@esss-swap/duo-validation';

import { AdminDataSource } from '../datasources/AdminDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Page } from '../models/Admin';
import { Institution } from '../models/Institution';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { Rejection, rejection } from '../rejection';
import { CreateApiAccessTokenInput } from '../resolvers/mutations/CreateApiAccessTokenMutation';
import { CreateInstitutionsArgs } from '../resolvers/mutations/CreateInstitutionsMutation';
import { DeleteApiAccessTokenInput } from '../resolvers/mutations/DeleteApiAccessTokenMutation';
import { UpdateApiAccessTokenInput } from '../resolvers/mutations/UpdateApiAccessTokenMutation';
import { UpdateInstitutionsArgs } from '../resolvers/mutations/UpdateInstitutionsMutation';
import { generateUniqueId } from '../utils/helperFunctions';
import { signToken } from '../utils/jwt';

const IS_BACKEND_VALIDATION = true;

export default class AdminMutations {
  constructor(private dataSource: AdminDataSource) {}

  @Authorized([Roles.USER_OFFICER])
  async resetDB(agent: UserWithRole | null): Promise<string | Rejection> {
    if (process.env.NODE_ENV === 'development') {
      logger.logWarn('Resetting database', {});

      return this.dataSource.resetDB();
    } else {
      return rejection('NOT_ALLOWED');
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async applyPatches(agent: UserWithRole | null): Promise<string | Rejection> {
    logger.logWarn('Applying patches', {});

    return this.dataSource.applyPatches();
  }

  @ValidateArgs(setPageTextValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async setPageText(
    agent: UserWithRole | null,
    { id, text }: { id: number; text: string }
  ): Promise<Page | Rejection> {
    return this.dataSource
      .setPageText(id, text)
      .then(page => {
        return page;
      })
      .catch(error => {
        logger.logException('Could not set page text', error, {
          agent,
          id,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async updateInstitutions(
    agent: UserWithRole | null,
    args: UpdateInstitutionsArgs
  ) {
    const institution = await this.dataSource.getInstitution(args.id);
    if (!institution) {
      return rejection('NOT_ALLOWED');
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
  async deleteInstitutions(agent: UserWithRole | null, id: number) {
    const institution = await this.dataSource.getInstitution(id);
    if (!institution) {
      return rejection('NOT_ALLOWED');
    }

    const institutionUsers = await this.dataSource.getInstitutionUsers(id);
    if (institutionUsers.length !== 0) {
      return rejection('VALUE_CONSTRAINT_REJECTION');
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
    const generatedAccessToken = signToken({ accessTokenId });

    const result = await this.dataSource.createApiAccessToken(
      { accessPermissions, name: args.name },
      accessTokenId,
      generatedAccessToken
    );

    if (generatedAccessToken === result.accessToken) {
      return result;
    } else {
      return rejection('NOT_ALLOWED');
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
      logger.logException('Could not update api access token', error, {
        agent,
        args,
      });

      return rejection('INTERNAL_ERROR');
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
      logger.logException('Could not remove api access token', error, {
        agent,
        args,
      });

      return rejection('INTERNAL_ERROR');
    }
  }
}
