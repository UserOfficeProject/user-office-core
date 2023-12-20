import { getToken } from '../api/getToken';
import { createAndLogError } from './createAndLogError';
import { getEnvOrThrow } from './getEnvOrThrow';

export async function performApiRequest(requestData: string) {
  try {
    const accessToken = await getToken();

    const response = await fetch(getEnvOrThrow('EAM_API_URL'), {
      method: 'POST',
      body: requestData,
      headers: {
        'Content-Type': 'text/xml',
        Authorization: `Bearer ${accessToken.token.access_token}`,
      },
    });

    const data = await response.text();

    if (!response.ok) {
      throw createAndLogError('Failed to execute registerAssetInEAM', {
        data,
      });
    }

    return data;
  } catch (error) {
    throw createAndLogError('Error while calling EAM API', {
      error,
      requestData,
    });
  }
}
