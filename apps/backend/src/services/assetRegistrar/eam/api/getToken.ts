import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { ModuleOptions, ResourceOwnerPassword } from 'simple-oauth2';

import { getEnvOrThrow } from '../utils/getEnvOrThrow';

export async function getToken() {
  try {
    console.log('11------------------------');
    const config: ModuleOptions = {
      client: {
        id: getEnvOrThrow('EAM_AUTH_CLIENT_ID'),
        secret: getEnvOrThrow('EAM_AUTH_CLIENT_SECRET'),
      },
      auth: {
        tokenHost: getEnvOrThrow('EAM_AUTH_HOST'),
        tokenPath: 'InforIntSTS/connect/token',
      },
    };
    console.log('22------------------------');
    const client = new ResourceOwnerPassword(config);
    console.log('33------------------------');
    const tokenParams = {
      username: getEnvOrThrow('EAM_AUTH_USER'),
      password: getEnvOrThrow('EAM_AUTH_PASS'),
      scope: 'offline_access',
    };
  } catch (error) {
    logger.logException('eeeeeeeeeee', error);
    throw new GraphQLError('eeeeeeeee');
  }
  console.log('44------------------------');
  try {
    return await client.getToken(tokenParams);
  } catch (error) {
    logger.logException('Access Token Error', error);
    throw new GraphQLError('Access Token Error');
  }
}
