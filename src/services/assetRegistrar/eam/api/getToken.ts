import { logger } from '@user-office-software/duo-logger';
import { ModuleOptions, ResourceOwnerPassword } from 'simple-oauth2';

import { getEnvOrThrow } from '../utils/getEnvOrThrow';

export async function getToken() {
  const config: ModuleOptions = {
    client: {
      id: 'infor~pAVcElz8D8rmSWLPp9TmHDwLTOpOo2f3OW-2DDpW5xg',
      secret: getEnvOrThrow('EAM_AUTH_SECRET'),
    },
    auth: {
      tokenHost: getEnvOrThrow('EAM_AUTH_URL'),
      tokenPath: 'InforIntSTS/connect/token',
    },
  };
  const client = new ResourceOwnerPassword(config);

  const tokenParams = {
    username: getEnvOrThrow('EAM_AUTH_USER'),
    password: getEnvOrThrow('EAM_AUTH_PASS'),
    scope: 'offline_access',
  };

  try {
    return await client.getToken(tokenParams);
  } catch (error) {
    logger.logException('Access Token Error', error);
    throw new Error('Access Token Error');
  }
}
