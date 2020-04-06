import { AdminDataSource } from '../datasources/AdminDataSource';
import { Page } from '../models/Admin';
import { User } from '../models/User';
import { Rejection, rejection } from '../rejection';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class AdminMutations {
  async resetDB(): Promise<boolean | Rejection> {
    if (process.env.NODE_ENV === 'development') {
      logger.logWarn('Resetting database', {});

      return this.dataSource.resetDB();
    } else {
      return rejection('NOT_ALLOWED');
    }
  }
  constructor(
    private dataSource: AdminDataSource,
    private userAuth: UserAuthorization
  ) {}

  async setPageText(
    agent: User | null,
    id: number,
    text: string
  ): Promise<Page | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection('NOT_AUTHORIZED');
    }

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
