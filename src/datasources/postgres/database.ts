import Knex from 'knex';

import { logger } from '../../utils/Logger';

const db = Knex({
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
});

db.on('query-error', function(error: any, obj: any) {
  logger.logError('QUERY ERROR', { error, obj });
});

if (process.env.DATABASE_LOG_QUERIES === '1') {
  db.on('query', function({ sql }: any) {
    // TODO: add timestamp to logger (maybe only ConsoleLogger needs it)
    logger.logDebug(`${new Date().toISOString()} - QUERY`, sql);
  });
}

export default db;
