import { Agent } from 'undici';

import { createAndLogError } from './createAndLogError';
import { getEnvOrThrow } from './getEnvOrThrow';

export async function performApiRequest(uri: string, requestData: object) {
  try {
    const response = await fetch(getEnvOrThrow('EAM_API_URL') + uri, {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': 'application/json',
        INFOR_USER: getEnvOrThrow('EAM_AUTH_USER'),
        INFOR_PASSWORD: getEnvOrThrow('EAM_AUTH_PASSWORD'),
        INFOR_TENANT: getEnvOrThrow('EAM_AUTH_TENANT'),
        INFOR_ORGANIZATION: getEnvOrThrow('EAM_AUTH_ORGANIZATION'),
      },
      dispatcher: new Agent({
        connect: {
          rejectUnauthorized: getEnvOrThrow('EAM_SKIP_SSL_CERT_SECURITY')
            ? false
            : true,
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw createAndLogError('Failed to execute registerAssetInEAM', {
        data,
        url: getEnvOrThrow('EAM_API_URL') + uri,
        requestData,
      });
    }

    return data;
  } catch (error) {
    throw createAndLogError('Error while calling EAM API', {
      error,
      url: getEnvOrThrow('EAM_API_URL') + uri,
      requestData,
    });
  }
}
