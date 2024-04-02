import { logger } from '@user-office-software/duo-logger';
import 'reflect-metadata';

switch (process.env.DEPENDENCY_CONFIG) {
  case 'e2e':
    require('./dependencyConfigE2E');
    break;
  case 'ess':
    require('./dependencyConfigESS');
    break;
  case 'stfc':
    require('./dependencyConfigSTFC');
    break;
  case 'test':
    require('./dependencyConfigTest');
    break;
  default:
    logger.logInfo(
      'Invalid or no value was provided for the DEPENDENCY_CONFIG. Using the default config',
      { DEPENDENCY_CONFIG: process.env.DEPENDENCY_CONFIG }
    );

    require('./dependencyConfigDefault');
}

export {};
