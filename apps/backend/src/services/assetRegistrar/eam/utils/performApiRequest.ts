import { createAndLogError } from './createAndLogError';
import { getEnvOrThrow } from './getEnvOrThrow';

export async function performApiRequest(uri: string, requestData: object) {
  try {
    const base64Credentials = btoa(
      `${getEnvOrThrow('EAM_AUTH_USER')}:${getEnvOrThrow('EAM_AUTH_PASSWORD')}`
    );
    const response = await fetch(getEnvOrThrow('EAM_API_URL') + uri, {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${base64Credentials}`,
        tenant: getEnvOrThrow('EAM_AUTH_TENANT'),
        organization: getEnvOrThrow('EAM_ORGANIZATION_CODE'),
      },
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
