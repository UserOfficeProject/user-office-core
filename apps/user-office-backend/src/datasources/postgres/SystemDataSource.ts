import { logger } from '@user-office-software/duo-logger';

import { SystemDataSource } from '../SystemDataSource';
import database from './database';

export default class PostgresSystemDataSource implements SystemDataSource {
  async connectivityCheck(): Promise<boolean> {
    try {
      return database
        .raw('select 1+1 as result')
        .then(() => {
          return true;
        })
        .catch((error) => {
          logger.logException('connectivityCheck failed', error);

          return false;
        });
    } catch (error) {
      logger.logException('connectivityCheck failed', error);

      return false;
    }
  }
}
