import { setPageTextValidationSchema } from '@esss-swap/duo-validation';

import { AdminDataSource } from '../datasources/AdminDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Page } from '../models/Admin';
import { Institution } from '../models/Institution';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { Rejection, rejection } from '../rejection';
import { CreateInstitutionsArgs } from '../resolvers/mutations/CreateInstitutionsMutation';
import { UpdateInstitutionsArgs } from '../resolvers/mutations/UpdateInstitutionsMutation';
import { logger } from '../utils/Logger';

export default class AdminMutations {
  constructor(private dataSource: AdminDataSource) {}

  async resetDB(): Promise<string | Rejection> {
    if (process.env.NODE_ENV === 'development') {
      logger.logWarn('Resetting database', {});

      return this.dataSource.resetDB();
    } else {
      return rejection('NOT_ALLOWED');
    }
  }

  async applyPatches(): Promise<string | Rejection> {
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

    return await this.dataSource.deleteInstitution(id);
  }

  async addClientLog(error: string) {
    logger.logError('Error received from client', { error });

    return true;
  }
}
