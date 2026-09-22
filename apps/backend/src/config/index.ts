/* eslint-disable @typescript-eslint/no-require-imports */
import { logger } from '@user-office-software/duo-logger';
import 'reflect-metadata';
import path from 'node:path';

const dependencyConfig = process.env.DEPENDENCY_CONFIG || 'default';

switch (dependencyConfig) {
  case 'test':
    require('./dependencyConfigTest');
    break;
  default: {
    const configPath = path.resolve(process.cwd(), dependencyConfig);

    try {
      require.resolve(configPath);
    } catch {
      logger.logInfo(
        'Could not find the configured dependency config. Using the default config',
        { DEPENDENCY_CONFIG: dependencyConfig, resolvedPath: configPath }
      );
      require('./dependencyConfigDefault');
      break;
    }

    require(configPath);
  }
}

export {};
