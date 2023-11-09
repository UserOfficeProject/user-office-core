import { promises } from 'fs';
import { join } from 'path';

import { logger } from '@user-office-software/duo-logger';
import { Resolver, Query } from 'type-graphql';

let cachedVersion: string;

@Resolver()
export class SystemQuery {
  @Query(() => String)
  async version() {
    try {
      const content = await promises.readFile(
        join(process.cwd(), 'build-version.txt')
      );

      cachedVersion = content.toString().trim();

      return cachedVersion;
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        logger.logException(
          'Unknown error while reading build-version.txt',
          err
        );
      }

      return '<unknown>';
    }
  }

  @Query(() => String)
  async factoryVersion() {
    try {
      const url = new URL(process.env.USER_OFFICE_FACTORY_ENDPOINT as string);
      url.pathname = '/version';

      const response = await fetch(url.toString());

      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(
            `An error occurred while sending the request: ${text}`
          );
        });
      }

      return await response.text();
    } catch (err) {
      logger.logException(
        'Unknown error while requesting factory build-version.txt',
        err
      );

      return '<unknown>';
    }
  }
}
