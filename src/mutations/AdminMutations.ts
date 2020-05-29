import { AdminDataSource } from '../datasources/AdminDataSource';
import { Authorized } from '../decorators';
import { Page } from '../models/Admin';
import { Roles } from '../models/Role';
import { User } from '../models/User';
import { Rejection, rejection } from '../rejection';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class AdminMutations {
  constructor(
    private dataSource: AdminDataSource,
    private userAuth: UserAuthorization
  ) {}

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

  @Authorized([Roles.USER_OFFICER])
  async setPageText(
    agent: User | null,
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

  async addClientLog(error: string) {
    logger.logError('Error received from client', { error });

    return true;
  }
}
